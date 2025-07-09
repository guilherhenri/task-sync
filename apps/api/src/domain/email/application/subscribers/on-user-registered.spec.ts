import type { EmailTemplateType } from '@task-sync/api-types'
import { makeUser } from '@test/factories/make-user'
import { InMemoryEmailRequestsRepository } from '@test/repositories/in-memory-email-requests-repository'
import { InMemoryUsersRepository } from '@test/repositories/in-memory-users-repository'
import { InMemoryAuthUserService } from '@test/services/in-memory-auth-user-service'
import { InMemoryEmailQueueService } from '@test/services/in-memory-email-queue-service'
import { waitFor } from '@test/utils/wait-for'

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
    sut = new CreateEmailRequestUseCase(
      inMemoryEmailRequestsRepository,
      inMemoryEmailQueueService,
    )

    createEmailRequestExecuteSpy = jest.spyOn(sut, 'execute')

    new OnUserRegistered(inMemoryAuthUserService, sut)
  })

  it('should add an email request to the queue when a user is registered', async () => {
    const user = await makeUser()

    await inMemoryUsersRepository.create(user)

    await waitFor(() => expect(createEmailRequestExecuteSpy).toHaveBeenCalled())
  })
})
