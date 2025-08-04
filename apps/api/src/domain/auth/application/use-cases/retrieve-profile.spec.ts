import { makeUser } from '@test/factories/make-user'
import { InMemoryUsersRepository } from '@test/repositories/in-memory-users-repository'

import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { RetrieveProfileUseCase } from './retrieve-profile'

let inMemoryUsersRepository: InMemoryUsersRepository
let sut: RetrieveProfileUseCase

describe('Retrieve Profile Use-case', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    sut = new RetrieveProfileUseCase(inMemoryUsersRepository)
  })

  it('should be able to retrieve a profile for a valid user id', async () => {
    const user = makeUser(
      { name: 'User Test', email: 'example@email.com' },
      new UniqueEntityID('user-id'),
    )
    inMemoryUsersRepository.items.push(user)

    const response = await sut.execute({ userId: 'user-id' })

    expect(response.isRight()).toBeTruthy()

    if (response.isRight()) {
      const { user } = response.value
      expect(user).toEqual(
        expect.objectContaining({
          name: 'User Test',
          email: 'example@email.com',
        }),
      )
    }
  })

  it('should not be able to retrieve a  profile for a user does not exist', async () => {
    const response = await sut.execute({ userId: 'user-id' })

    expect(response.isLeft()).toBeTruthy()
    expect(response.value).toHaveProperty('message', 'Usuário não encontrado.')
  })
})
