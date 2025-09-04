import { BullModule } from '@nestjs/bull'
import { Test, type TestingModule } from '@nestjs/testing'
import type { EmailTemplateType } from '@task-sync/api-types'
import { makeEmailRequest } from '@test/factories/make-email-request'
import { waitFor } from '@test/utils/wait-for'
import type { Job } from 'bull'

import { left, right } from '@/core/either'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ResourceNotFoundError } from '@/domain/auth/application/use-cases/errors/resource-not-found'
import { GetEmailRequestByIdUseCase } from '@/domain/email/application/use-cases/get-email-request-by-id'
import { UpdateEmailRequestStatusUseCase } from '@/domain/email/application/use-cases/update-email-request-status'
import type { EmailRequest } from '@/domain/email/enterprise/entities/email-request'
import { EmailStatus } from '@/domain/email/enterprise/entities/value-objects/email-status'
import { EmailService } from '@/infra/email/contracts/email-service'
import { KeyValuesRepository } from '@/infra/key-value/key-values-repository'
import { ObservabilityModule } from '@/infra/observability/observability.module'

import { BullEmailQueueWorker } from './bull-email-queue.worker'

jest.mock('@task-sync/env', () => ({
  env: {
    ...process.env,
    NODE_ENV: 'test',
  },
}))

type MockEmailService = {
  sendEmail: jest.MockedFunction<EmailService['sendEmail']>
}

type MockKeyValuesRepository = {
  lpush: jest.MockedFunction<KeyValuesRepository['lpush']>
  publish: jest.MockedFunction<KeyValuesRepository['publish']>
}

type MockGetEmailRequestByIdUseCase = {
  execute: jest.MockedFunction<GetEmailRequestByIdUseCase['execute']>
}

type MockUpdateEmailRequestStatusUseCase = {
  execute: jest.MockedFunction<UpdateEmailRequestStatusUseCase['execute']>
}

const mockJob = {
  name: 'send-email',
  data: { emailRequestId: '123' },
  id: 'test-job-1',
} as Job

describe('Bull Email Queue Worker', () => {
  let module: TestingModule
  let worker: BullEmailQueueWorker
  let emailService: MockEmailService
  let keyValuesRepository: MockKeyValuesRepository
  let getEmailRequestByIdUseCase: MockGetEmailRequestByIdUseCase
  let updateEmailRequestStatusUseCase: MockUpdateEmailRequestStatusUseCase
  let mockEmailRequest: EmailRequest<EmailTemplateType>

  beforeAll(async () => {
    mockEmailRequest = makeEmailRequest(
      {
        recipientEmail: 'test@email.com',
        subject: 'Welcome',
      },
      new UniqueEntityID('123'),
    )
    emailService = {
      sendEmail: jest.fn().mockResolvedValue(undefined),
    }

    keyValuesRepository = {
      lpush: jest.fn().mockResolvedValue(undefined),
      publish: jest.fn().mockResolvedValue(undefined),
    }

    getEmailRequestByIdUseCase = {
      execute: jest.fn().mockResolvedValue(
        right({
          emailRequest: mockEmailRequest,
        }),
      ),
    }

    updateEmailRequestStatusUseCase = {
      execute: jest.fn().mockResolvedValue(
        right({
          emailRequest: makeEmailRequest({ status: new EmailStatus('sent') }),
        }),
      ),
    }

    module = await Test.createTestingModule({
      imports: [
        BullModule.registerQueue({ name: 'email-queue' }),
        ObservabilityModule,
      ],
      providers: [
        BullEmailQueueWorker,
        { provide: KeyValuesRepository, useValue: keyValuesRepository },
        { provide: EmailService, useValue: emailService },
        {
          provide: GetEmailRequestByIdUseCase,
          useValue: getEmailRequestByIdUseCase,
        },
        {
          provide: UpdateEmailRequestStatusUseCase,
          useValue: updateEmailRequestStatusUseCase,
        },
      ],
    }).compile()

    worker = module.get(BullEmailQueueWorker)

    await module.init()
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterAll(async () => {
    await module.close()
  })

  it('should process email job successfully', async () => {
    await worker.handle(mockJob)

    await waitFor(async () => {
      expect(emailService.sendEmail).toHaveBeenCalledWith({
        to: 'test@email.com',
        subject: 'Welcome',
        html: expect.any(String),
      })

      expect(updateEmailRequestStatusUseCase.execute).toHaveBeenCalledWith({
        emailRequestId: '123',
        statusTransition: 'progress',
      })

      expect(keyValuesRepository.publish).toHaveBeenCalledWith(
        'email:status',
        JSON.stringify({ event: 'email_sent', emailRequestId: '123' }),
      )
    })
  })

  it('should return early when email request is not found', async () => {
    getEmailRequestByIdUseCase.execute.mockResolvedValueOnce(
      left(new ResourceNotFoundError('Solicitação de e-mail não encontrada.')),
    )

    await worker.handle(mockJob)

    await waitFor(async () => {
      expect(emailService.sendEmail).not.toHaveBeenCalled()
      expect(keyValuesRepository.publish).not.toHaveBeenCalled()
    })
  })

  it('should return early when update status fails initially', async () => {
    updateEmailRequestStatusUseCase.execute.mockResolvedValueOnce(
      left(new Error('Erro ao atualizar status')),
    )

    await worker.handle(mockJob)

    await waitFor(async () => {
      expect(emailService.sendEmail).not.toHaveBeenCalled()
      expect(keyValuesRepository.publish).not.toHaveBeenCalled()
    })
  })

  it('should continue even when status update fails after successful email send', async () => {
    updateEmailRequestStatusUseCase.execute
      .mockResolvedValueOnce(right({ emailRequest: mockEmailRequest }))
      .mockResolvedValueOnce(left(new Error('Erro ao atualizar status')))

    await worker.handle(mockJob)

    await waitFor(async () => {
      expect(emailService.sendEmail).toHaveBeenCalled()
      expect(keyValuesRepository.lpush).toHaveBeenCalledWith(
        'status:update:queue',
        JSON.stringify({
          emailRequestId: '123',
          statusTransition: 'progress',
          attempts: 0,
        }),
      )
    })
  })

  it('should retry sending email after initial failure', async () => {
    emailService.sendEmail
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(undefined)

    updateEmailRequestStatusUseCase.execute
      .mockResolvedValueOnce(right({ emailRequest: mockEmailRequest }))
      .mockResolvedValueOnce(
        right({
          emailRequest: makeEmailRequest(
            {
              ...mockEmailRequest,
              status: new EmailStatus('failed'),
            },
            mockEmailRequest.id,
          ),
        }),
      )
      .mockResolvedValueOnce(
        right({
          emailRequest: makeEmailRequest(
            {
              ...mockEmailRequest,
              status: new EmailStatus('sent'),
            },
            mockEmailRequest.id,
          ),
        }),
      )

    await worker.handle(mockJob)

    await waitFor(async () => {
      expect(emailService.sendEmail).toHaveBeenCalledTimes(2)
      expect(updateEmailRequestStatusUseCase.execute).toHaveBeenCalledWith({
        emailRequestId: '123',
        statusTransition: 'setFailed',
      })
      expect(updateEmailRequestStatusUseCase.execute).toHaveBeenCalledWith({
        emailRequestId: '123',
        statusTransition: 'setSent',
      })
    })
  })

  it('should finish when failure sending email and updating status', async () => {
    emailService.sendEmail.mockRejectedValueOnce(new Error('Network error'))

    updateEmailRequestStatusUseCase.execute
      .mockResolvedValueOnce(right({ emailRequest: mockEmailRequest }))
      .mockResolvedValueOnce(left(new Error('Erro ao atualizar status')))

    await worker.handle(mockJob)

    await waitFor(async () => {
      expect(emailService.sendEmail).toHaveBeenCalledTimes(1)
      expect(keyValuesRepository.lpush).toHaveBeenCalledWith(
        'status:update:queue',
        JSON.stringify({
          emailRequestId: '123',
          statusTransition: 'setFailed',
          attempts: 0,
        }),
      )
    })
  })

  it('should finish when failure updating status on retry attempt', async () => {
    emailService.sendEmail.mockRejectedValueOnce(new Error('Network error'))

    updateEmailRequestStatusUseCase.execute
      .mockResolvedValueOnce(right({ emailRequest: mockEmailRequest }))
      .mockResolvedValueOnce(
        right({
          emailRequest: makeEmailRequest(
            {
              ...mockEmailRequest,
              status: new EmailStatus('failed'),
            },
            mockEmailRequest.id,
          ),
        }),
      )
      .mockResolvedValueOnce(left(new Error('Erro ao atualizar status')))

    await worker.handle(mockJob)

    await waitFor(async () => {
      expect(emailService.sendEmail).toHaveBeenCalledTimes(2)
      expect(keyValuesRepository.lpush).toHaveBeenCalledWith(
        'status:update:queue',
        JSON.stringify({
          emailRequestId: '123',
          statusTransition: 'setSent',
          attempts: 0,
        }),
      )
    })
  })

  it('should add to DLQ after 3 failed retry attempts', async () => {
    emailService.sendEmail.mockRejectedValue(new Error('Persistent error'))

    updateEmailRequestStatusUseCase.execute
      .mockResolvedValueOnce(right({ emailRequest: mockEmailRequest }))
      .mockResolvedValue(
        right({
          emailRequest: makeEmailRequest(
            {
              ...mockEmailRequest,
              status: new EmailStatus('failed'),
            },
            mockEmailRequest.id,
          ),
        }),
      )

    await worker.handle(mockJob)

    await waitFor(async () => {
      expect(emailService.sendEmail).toHaveBeenCalledTimes(4) // inicial + 3 retries
      expect(keyValuesRepository.lpush).toHaveBeenCalledWith('email:dlq', '123')
      expect(keyValuesRepository.publish).toHaveBeenCalledWith(
        'email:status',
        JSON.stringify({ event: 'email_failed', emailRequestId: '123' }),
      )
    }, 8000)
  }, 8000)
})
