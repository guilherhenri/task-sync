import type { EmailTemplateType } from '@task-sync/api-types'
import { makeUser } from '@test/factories/make-user'
import { FakeLogger } from '@test/logging/fake-logger'
import { FakeMetrics } from '@test/metrics/fake-metrics'
import { InMemoryEmailRequestsRepository } from '@test/repositories/in-memory-email-requests-repository'
import { InMemoryUsersRepository } from '@test/repositories/in-memory-users-repository'
import { InMemoryAuthUserService } from '@test/services/in-memory-auth-user-service'
import { InMemoryEmailQueueService } from '@test/services/in-memory-email-queue-service'
import { waitFor } from '@test/utils/wait-for'

import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { DomainEvents } from '@/core/events/domain-events'
import { UserRegisteredEvent } from '@/domain/auth/enterprise/events/user-registered-event'

import {
  CreateEmailRequestUseCase,
  type CreateEmailRequestUseCaseRequest,
  type CreateEmailRequestUseCaseResponse,
} from '../use-cases/create-email-request'
import { OnUserRegistered } from './on-user-registered'

let inMemoryUsersRepository: InMemoryUsersRepository
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

describe('On User Registered', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
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

    new OnUserRegistered(inMemoryAuthUserService, sut, fakeLogger, fakeMetrics)
  })

  it('should add an email request to the queue when a user is registered', async () => {
    const user = makeUser()

    await inMemoryUsersRepository.create(user)

    await waitFor(() => expect(createEmailRequestExecuteSpy).toHaveBeenCalled())
  })

  it('should throw an error when user is not found', async () => {
    const event = new UserRegisteredEvent(
      makeUser({}, new UniqueEntityID('non-existent-user')),
    )

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handlers = (DomainEvents as any).handlersMap[UserRegisteredEvent.name]
    const handler = handlers[0]

    expect(handler(event)).rejects.toThrow('Usuário não encontrado.')

    DomainEvents.clearHandlers()
  })
})
