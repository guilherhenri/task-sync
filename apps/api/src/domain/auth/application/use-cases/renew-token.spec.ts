import { makeUser } from '@test/factories/make-user'
import { InMemoryAuthTokensRepository } from '@test/repositories/in-memory-auth-tokens-repository'
import { InMemoryUsersRepository } from '@test/repositories/in-memory-users-repository'
import { InMemoryAuthService } from '@test/services/in-memory-auth-service'

import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { AuthToken } from '../../enterprise/entities/auth-token'
import { RenewTokenUseCase } from './renew-token'

let inMemoryUsersRepository: InMemoryUsersRepository
let inMemoryAuthTokensRepository: InMemoryAuthTokensRepository
let inMemoryAuthService: InMemoryAuthService
let sut: RenewTokenUseCase

describe('Renew Token Use-case', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    inMemoryAuthTokensRepository = new InMemoryAuthTokensRepository()
    inMemoryAuthService = new InMemoryAuthService()
    sut = new RenewTokenUseCase(
      inMemoryUsersRepository,
      inMemoryAuthTokensRepository,
      inMemoryAuthService,
    )
  })

  it('should be able to renew a token with a valid refresh token', async () => {
    const user = await makeUser()
    inMemoryUsersRepository.items.push(user)

    const refreshToken = inMemoryAuthService.generateRefreshToken(
      user.id.toString(),
    )

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 dias

    const authToken = AuthToken.create({
      userId: user.id,
      refreshToken,
      expiresAt,
    })

    inMemoryAuthTokensRepository.items.push(authToken)

    // Wait for generate different tokens
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const response = await sut.execute({
      userId: user.id.toString(),
      refreshToken,
    })

    expect(response.isRight()).toBeTruthy()

    if (response.isRight()) {
      expect(response.value).toHaveProperty('accessToken')
      expect(response.value).toHaveProperty('refreshToken')
      expect(response.value.refreshToken).not.toEqual(refreshToken)

      expect(inMemoryAuthTokensRepository.items).toHaveLength(1)
      expect(inMemoryAuthTokensRepository.items[0].userId).toBe(user.id)
      expect(inMemoryAuthTokensRepository.items[0].refreshToken).not.toEqual(
        refreshToken,
      )
    }
  })

  it('should not be able to renew a token for an invalid user', async () => {
    const user = await makeUser({}, new UniqueEntityID('user-1'))
    inMemoryUsersRepository.items.push(user)

    const refreshToken = inMemoryAuthService.generateRefreshToken(
      user.id.toString(),
    )

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 dias

    const authToken = AuthToken.create({
      userId: user.id,
      refreshToken,
      expiresAt,
    })

    inMemoryAuthTokensRepository.items.push(authToken)

    const response = await sut.execute({
      userId: 'user-2',
      refreshToken,
    })

    expect(response.isLeft()).toBeTruthy()
    expect(response.value).toHaveProperty('message', 'Usuário não encontrado.')
    expect(inMemoryAuthTokensRepository.items).toHaveLength(1)
  })

  it('should not be able to renew a token with an invalid refresh token', async () => {
    const user = await makeUser()
    inMemoryUsersRepository.items.push(user)

    const response = await sut.execute({
      userId: user.id.toString(),
      refreshToken: 'invalid-refresh-token',
    })

    expect(response.isLeft()).toBeTruthy()
    expect(response.value).toHaveProperty('message', 'Token não encontrado.')
  })

  it('should not be able to renew a token with an expired refresh token and delete the expired token', async () => {
    const user = await makeUser()
    inMemoryUsersRepository.items.push(user)

    const refreshToken = inMemoryAuthService.generateRefreshToken(
      user.id.toString(),
    )

    const expiresAt = new Date(Date.now() - 1000) // past

    const authToken = AuthToken.create({
      userId: user.id,
      refreshToken,
      expiresAt,
    })

    inMemoryAuthTokensRepository.items.push(authToken)

    const response = await sut.execute({
      userId: user.id.toString(),
      refreshToken,
    })

    expect(response.isLeft()).toBeTruthy()
    expect(response.value).toHaveProperty('message', 'Token expirado.')
    expect(inMemoryAuthTokensRepository.items).toHaveLength(0)
  })

  it('should not be able to renew a token from another user', async () => {
    const user = await makeUser({}, new UniqueEntityID('user-1'))
    inMemoryUsersRepository.items.push(user)

    const refreshToken = inMemoryAuthService.generateRefreshToken(
      user.id.toString(),
    )

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 dias

    const authToken = AuthToken.create({
      userId: new UniqueEntityID('user-2'),
      refreshToken,
      expiresAt,
    })

    inMemoryAuthTokensRepository.items.push(authToken)

    const response = await sut.execute({
      userId: 'user-1',
      refreshToken,
    })

    expect(response.isLeft()).toBeTruthy()
    expect(response.value).toHaveProperty(
      'message',
      'Este token não pertence a este usuário.',
    )
  })
})
