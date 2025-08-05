import { BullModule, getQueueToken } from '@nestjs/bull'
import { Test, type TestingModule } from '@nestjs/testing'
import { waitFor } from '@test/utils/wait-for'
import { Queue } from 'bull'

import { GetEmailRequestByIdUseCase } from '@/domain/email/application/use-cases/get-email-request-by-id'
import { UpdateEmailRequestStatusUseCase } from '@/domain/email/application/use-cases/update-email-request-status'
import { EmailService } from '@/infra/email/contracts/email-service'
import { KeyValuesRepository } from '@/infra/key-value/key-values-repository'

import { BullEmailQueueWorker } from './bull-email-queue.worker'

describe('Bull Email Queue Worker', () => {
  let module: TestingModule
  let queue: Queue
  let sendEmailSpy: jest.Mock
  let updateEmailRequestStatusUseCaseExecuteSpy: jest.Mock
  let keyValueRepositoryPublishSpy: jest.Mock

  beforeAll(async () => {
    sendEmailSpy = jest.fn().mockResolvedValue(undefined)
    updateEmailRequestStatusUseCaseExecuteSpy = jest.fn().mockResolvedValue({
      isRight: () => true,
      value: {
        emailRequest: {
          id: '123',
          recipientEmail: 'test@email.com',
          subject: 'Welcome',
          status: { value: 'sent' },
        },
      },
    })
    keyValueRepositoryPublishSpy = jest.fn()

    module = await Test.createTestingModule({
      imports: [BullModule.registerQueue({ name: 'email-queue' })],
      providers: [
        BullEmailQueueWorker,
        {
          provide: EmailService,
          useValue: { sendEmail: sendEmailSpy },
        },
        {
          provide: KeyValuesRepository,
          useValue: { lpush: jest.fn(), publish: keyValueRepositoryPublishSpy },
        },
        {
          provide: GetEmailRequestByIdUseCase,
          useValue: {
            execute: jest.fn().mockResolvedValue({
              isRight: () => true,
              value: {
                emailRequest: {
                  id: '123',
                  recipientEmail: 'test@email.com',
                  subject: 'Welcome',
                  status: { value: 'pending' },
                },
              },
            }),
          },
        },
        {
          provide: UpdateEmailRequestStatusUseCase,
          useValue: {
            execute: updateEmailRequestStatusUseCaseExecuteSpy,
          },
        },
      ],
    }).compile()

    queue = module.get(getQueueToken('email-queue'))

    await module.init()
  })

  afterAll(async () => {
    await queue.empty()
    await queue.close()
    await module.close()
  })

  it('should process email job and update status to sent', async () => {
    await queue.add('send-email', { emailRequestId: '123' })

    await waitFor(async () => {
      expect(sendEmailSpy).toHaveBeenCalledWith({
        to: 'test@email.com',
        subject: 'Welcome',
        html: expect.any(String),
      })

      expect(updateEmailRequestStatusUseCaseExecuteSpy).toHaveBeenCalledWith({
        emailRequestId: '123',
        statusTransition: 'progress',
      })

      expect(keyValueRepositoryPublishSpy).toHaveBeenCalledWith(
        'email:status',
        JSON.stringify({ event: 'email_sent', emailRequestId: '123' }),
      )
    })
  })
})
