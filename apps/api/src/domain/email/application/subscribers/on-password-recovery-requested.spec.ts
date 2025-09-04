import type { EmailTemplateType } from '@task-sync/api-types'
import { makeUser } from '@test/factories/make-user'
import { makeVerificationToken } from '@test/factories/make-verification-token'
import { FakeLogger } from '@test/logging/fake-logger'
import { FakeMetrics } from '@test/metrics/fake-metrics'
import { InMemoryEmailRequestsRepository } from '@test/repositories/in-memory-email-requests-repository'
import { InMemoryUsersRepository } from '@test/repositories/in-memory-users-repository'
import { InMemoryVerificationTokensRepository } from '@test/repositories/in-memory-verification-tokens-repository'
import { InMemoryAuthUserService } from '@test/services/in-memory-auth-user-service'
import { InMemoryEmailQueueService } from '@test/services/in-memory-email-queue-service'
import { waitFor } from '@test/utils/wait-for'

import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { DomainEvents } from '@/core/events/domain-events'
import { PasswordRecoveryRequestedEvent } from '@/domain/auth/enterprise/events/password-recovery-requested-event'

import {
  CreateEmailRequestUseCase,
  type CreateEmailRequestUseCaseRequest,
  type CreateEmailRequestUseCaseResponse,
} from '../use-cases/create-email-request'
import { OnPasswordRecoveryRequested } from './on-password-recovery-requested'

let inMemoryUsersRepository: InMemoryUsersRepository
let inMemoryVerificationTokensRepository: InMemoryVerificationTokensRepository
let inMemoryAuthUserService: InMemoryAuthUserService
let inMemoryEmailRequestsRepository: InMemoryEmailRequestsRepository
let inMemoryEmailQueueService: InMemoryEmailQueueService
let fakeLogger: FakeLogger
let fakeMetrics: FakeMetrics
let sut: CreateEmailRequestUseCase

let createEmailRequestExecuteSpy: jest.SpyInstance<
  Promise<CreateEmailRequestUseCaseResponse>,
  [CreateEmailRequestUseCaseRequest<EmailTemplateType>]
>

jest.mock('@task-sync/env', () => ({
  env: {
    APP_URL: 'https://tasksync.com',
  },
}))

describe('On Password Recovery Requested', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    inMemoryVerificationTokensRepository =
      new InMemoryVerificationTokensRepository()
    inMemoryAuthUserService = new InMemoryAuthUserService(
      inMemoryUsersRepository,
    )
    inMemoryEmailRequestsRepository = new InMemoryEmailRequestsRepository()
    inMemoryEmailQueueService = new InMemoryEmailQueueService()
    fakeLogger = new FakeLogger()
    fakeMetrics = new FakeMetrics()
    sut = new CreateEmailRequestUseCase(
      inMemoryEmailRequestsRepository,
      inMemoryEmailQueueService,
      fakeLogger,
      fakeMetrics,
    )

    createEmailRequestExecuteSpy = jest.spyOn(sut, 'execute')

    new OnPasswordRecoveryRequested(
      inMemoryAuthUserService,
      sut,
      fakeLogger,
      fakeMetrics,
    )
  })

  it('should add an email request to the queue when a verify token is registered', async () => {
    const user = makeUser()
    inMemoryUsersRepository.items.push(user)

    const verificationToken = makeVerificationToken({
      type: 'password:recovery',
      userId: user.id,
    })

    inMemoryVerificationTokensRepository.save(verificationToken)

    await waitFor(() => expect(createEmailRequestExecuteSpy).toHaveBeenCalled())
  })

  it('should throw an error when user is not found', async () => {
    const event = new PasswordRecoveryRequestedEvent(
      makeVerificationToken({
        type: 'email:update:verify',
        userId: new UniqueEntityID('non-existent-user'),
      }),
    )

    const handlers = (DomainEvents as any).handlersMap[ // eslint-disable-line @typescript-eslint/no-explicit-any
      PasswordRecoveryRequestedEvent.name
    ]
    const handler = handlers[0]

    expect(handler(event)).rejects.toThrow('Usuário não encontrado.')

    DomainEvents.clearHandlers()
  })
})
