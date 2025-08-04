import { FakeHasher } from '@test/cryptography/fake-hasher'
import { makeUser } from '@test/factories/make-user'
import { InMemoryAuthTokensRepository } from '@test/repositories/in-memory-auth-tokens-repository'
import { InMemoryUsersRepository } from '@test/repositories/in-memory-users-repository'
import { InMemoryAuthService } from '@test/services/in-memory-auth-service'

import { AuthenticateSessionUseCase } from './authenticate-session'

let inMemoryUsersRepository: InMemoryUsersRepository
let inMemoryAuthTokensRepository: InMemoryAuthTokensRepository
let inMemoryAuthService: InMemoryAuthService
let sut: AuthenticateSessionUseCase
let fakeHasher: FakeHasher

describe('Authenticate Session Use-case', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    inMemoryAuthTokensRepository = new InMemoryAuthTokensRepository()
    inMemoryAuthService = new InMemoryAuthService()
    fakeHasher = new FakeHasher()
    sut = new AuthenticateSessionUseCase(
      inMemoryUsersRepository,
      inMemoryAuthTokensRepository,
      inMemoryAuthService,
      fakeHasher,
    )
  })

  it('should be able to authenticate with valid credentials and return tokens', async () => {
    const passwordHash = await fakeHasher.hash('123456')

    const user = makeUser({
      email: 'example@email.com',
      passwordHash,
    })
    inMemoryUsersRepository.items.push(user)

    const response = await sut.execute({
      email: 'example@email.com',
      password: '123456',
    })

    expect(response.isRight()).toBeTruthy()

    if (response.isRight()) {
      expect(response.value).toHaveProperty('accessToken')
      expect(response.value).toHaveProperty('refreshToken')
      expect(inMemoryAuthTokensRepository.items).toHaveLength(1)
      expect(inMemoryAuthTokensRepository.items[0].userId).toBe(user.id)
    }
  })

  it('should not be able to authenticate with invalid email', async () => {
    const user = makeUser({
      email: 'example@email.com',
    })
    inMemoryUsersRepository.items.push(user)

    const response = await sut.execute({
      email: 'other@email.com',
      password: '123456',
    })

    expect(response.isLeft()).toBeTruthy()
    expect(response.value).toBeInstanceOf(Error)
    expect(response.value).toHaveProperty(
      'message',
      'E-mail ou senha inválidos.',
    )
  })

  it('should not be able to authenticate with invalid password', async () => {
    const passwordHash = await fakeHasher.hash('123456')

    const user = makeUser({
      email: 'example@email.com',
      passwordHash,
    })
    inMemoryUsersRepository.items.push(user)

    const response = await sut.execute({
      email: 'example@email.com',
      password: '654321',
    })

    expect(response.isLeft()).toBeTruthy()
    expect(response.value).toBeInstanceOf(Error)
    expect(response.value).toHaveProperty(
      'message',
      'E-mail ou senha inválidos.',
    )
  })
})
