import { faker } from '@faker-js/faker'
import { makeUser } from '@test/factories/make-user'
import { InMemoryUsersRepository } from '@test/repositories/in-memory-users-repository'
import { InMemoryTokenService } from '@test/services/in-memory-token-service'

import { EnrollIdentityUseCase } from './enroll-identity'

let inMemoryUsersRepository: InMemoryUsersRepository
let inMemoryTokenService: InMemoryTokenService
let sut: EnrollIdentityUseCase

describe('Enroll Identity Use-case', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    inMemoryTokenService = new InMemoryTokenService()
    sut = new EnrollIdentityUseCase(
      inMemoryUsersRepository,
      inMemoryTokenService,
    )
  })

  it('should be able to enroll identity', async () => {
    const response = await sut.execute({
      name: 'Name Test',
      email: 'example@email.com',
      password: '123456',
      avatarUrl: faker.image.avatar(),
    })

    expect(response.isRight()).toBeTruthy()

    if (response.isRight()) {
      const { user } = response.value
      expect(user.email).toEqual('example@email.com')
      expect(inMemoryUsersRepository.items[0].id).toEqual(user.id)
    }

    expect(inMemoryTokenService.items.size).toEqual(1)
  })

  it('should not be able to enroll identity with an email that is already in use', async () => {
    const user = await makeUser({ email: 'example@email.com' })
    inMemoryUsersRepository.items.push(user)

    const response = await sut.execute({
      name: 'Name Test',
      email: 'example@email.com',
      password: '123456',
    })

    expect(response.isLeft()).toBeTruthy()
    expect(response.value).toBeInstanceOf(Error)
    expect(response.value).toHaveProperty(
      'message',
      'Este e-mail já está em uso.',
    )
  })

  it('should be able to hash password automatically', async () => {
    const response = await sut.execute({
      name: 'Name Test',
      email: 'example@email.com',
      password: '123456',
    })

    if (response.isRight()) {
      const { user } = response.value
      expect(user.passwordHash).not.toEqual('123456')
      expect(await user.verifyPassword('123456')).toBeTruthy()
    }
  })
})
