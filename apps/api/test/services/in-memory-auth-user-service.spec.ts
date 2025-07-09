import { makeUser } from '@test/factories/make-user'
import { InMemoryUsersRepository } from '@test/repositories/in-memory-users-repository'

import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { InMemoryAuthUserService } from './in-memory-auth-user-service'

let inMemoryAuthUserService: InMemoryAuthUserService
let inMemoryUsersRepository: InMemoryUsersRepository

describe('In Memory Auth User Service', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    inMemoryAuthUserService = new InMemoryAuthUserService(
      inMemoryUsersRepository,
    )
  })

  it('should be able to get a user from id', async () => {
    const user = await makeUser(
      {
        name: 'User Test',
        email: 'example@email.com',
      },
      new UniqueEntityID('user-id'),
    )

    inMemoryUsersRepository.items.push(user)

    const response =
      await inMemoryAuthUserService.getUserForEmailDelivery('user-id')

    expect(response).not.toBeNull()
    expect(response?.id.toString()).toEqual('user-id')
    expect(response?.name).toEqual('User Test')
    expect(response?.email).toEqual('example@email.com')
  })

  it('should not be able to get a user that does not exists', async () => {
    const response =
      await inMemoryAuthUserService.getUserForEmailDelivery('user-id')

    expect(response).toBeNull()
  })
})
