import { FakeEncryptor } from '@test/cryptography/fake-encryptor'
import { makeUser } from '@test/factories/make-user'
import { InMemoryAuthTokensRepository } from '@test/repositories/in-memory-auth-tokens-repository'
import { InMemoryUsersRepository } from '@test/repositories/in-memory-users-repository'

import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { AuthToken } from '../../enterprise/entities/auth-token'
import { ForbiddenActionError } from './errors/forbidden-action'
import { RefreshTokenExpiredError } from './errors/refresh-token-expired'
import { ResourceNotFoundError } from './errors/resource-not-found'
import { RenewTokenUseCase } from './renew-token'

let inMemoryUsersRepository: InMemoryUsersRepository
let inMemoryAuthTokensRepository: InMemoryAuthTokensRepository
let fakeEncryptor: FakeEncryptor
let sut: RenewTokenUseCase

describe('Renew Token Use-case', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    inMemoryAuthTokensRepository = new InMemoryAuthTokensRepository()
    fakeEncryptor = new FakeEncryptor()
    sut = new RenewTokenUseCase(
      inMemoryUsersRepository,
      inMemoryAuthTokensRepository,
      fakeEncryptor,
    )
  })

  it('should be able to renew a token with a valid user id', async () => {
    const user = makeUser()
    inMemoryUsersRepository.items.push(user)

    const refreshToken = await fakeEncryptor.encrypt({
      sub: user.id.toString(),
    })

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 dias

    const authToken = AuthToken.create({
      userId: user.id,
      refreshToken,
      expiresAt,
    })
    inMemoryAuthTokensRepository.items.push(authToken)

    const response = await sut.execute({
      userId: user.id.toString(),
    })

    expect(response.isRight()).toBeTruthy()

    if (response.isRight()) {
      expect(response.value).toHaveProperty('accessToken')

      expect(inMemoryAuthTokensRepository.items).toHaveLength(1)
      expect(inMemoryAuthTokensRepository.items[0].userId).toBe(user.id)
    }
  })

  it('should not be able to renew a token for an invalid user', async () => {
    const user = makeUser({}, new UniqueEntityID('user-1'))
    inMemoryUsersRepository.items.push(user)

    const refreshToken = await fakeEncryptor.encrypt({
      sub: user.id.toString(),
    })

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 dias

    const authToken = AuthToken.create({
      userId: user.id,
      refreshToken,
      expiresAt,
    })
    inMemoryAuthTokensRepository.items.push(authToken)

    const response = await sut.execute({
      userId: 'user-2',
    })

    expect(response.isLeft()).toBeTruthy()
    expect(response.value).toBeInstanceOf(ResourceNotFoundError)
    expect(response.value).toHaveProperty('message', 'Usuário não encontrado.')
    expect(inMemoryAuthTokensRepository.items).toHaveLength(1)
  })

  it('should not be able to renew a token with an invalid refresh token', async () => {
    const user = makeUser()
    inMemoryUsersRepository.items.push(user)

    const response = await sut.execute({
      userId: user.id.toString(),
    })

    expect(response.isLeft()).toBeTruthy()
    expect(response.value).toBeInstanceOf(RefreshTokenExpiredError)
    expect(response.value).toHaveProperty(
      'message',
      'Refresh token expirado ou inválido.',
    )
  })

  it('should not be able to renew a token with an expired refresh token and delete the expired token', async () => {
    const user = makeUser()
    inMemoryUsersRepository.items.push(user)

    const refreshToken = await fakeEncryptor.encrypt({
      sub: user.id.toString(),
    })

    const expiresAt = new Date(Date.now() - 1000) // past

    const authToken = AuthToken.create({
      userId: user.id,
      refreshToken,
      expiresAt,
    })
    inMemoryAuthTokensRepository.items.push(authToken)

    const response = await sut.execute({
      userId: user.id.toString(),
    })

    expect(response.isLeft()).toBeTruthy()
    expect(response.value).toBeInstanceOf(RefreshTokenExpiredError)
    expect(response.value).toHaveProperty(
      'message',
      'Refresh token expirado ou inválido.',
    )
    expect(inMemoryAuthTokensRepository.items).toHaveLength(0)
  })

  it('should not be able to renew a token from another user', async () => {
    const user = makeUser({}, new UniqueEntityID('user-1'))
    inMemoryUsersRepository.items.push(user)

    const refreshToken = await fakeEncryptor.encrypt({
      sub: user.id.toString(),
    })

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 dias

    const authToken = AuthToken.create({
      userId: user.id,
      refreshToken,
      expiresAt,
    })
    inMemoryAuthTokensRepository.items.push(authToken)

    jest
      .spyOn(inMemoryAuthTokensRepository, 'findByUserId')
      .mockImplementation(async () => {
        return AuthToken.create({
          userId: new UniqueEntityID('user-2'),
          refreshToken,
          expiresAt,
        })
      })

    const response = await sut.execute({
      userId: 'user-1',
    })

    expect(response.isLeft()).toBeTruthy()
    expect(response.value).toBeInstanceOf(ForbiddenActionError)
    expect(response.value).toHaveProperty(
      'message',
      'Este token não pertence a este usuário.',
    )
  })
})
