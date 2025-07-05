import { InMemoryAuthTokensRepository } from '@test/repositories/in-memory-auth-tokens-repository'
import { InMemoryAuthService } from '@test/services/in-memory-auth-service'

import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { AuthToken } from '../../enterprise/entities/auth-token'
import { TerminateSessionUseCase } from './terminate-session'

let inMemoryAuthService: InMemoryAuthService
let inMemoryAuthTokensRepository: InMemoryAuthTokensRepository
let sut: TerminateSessionUseCase

describe('Terminate Session Use-case', () => {
  beforeEach(() => {
    inMemoryAuthService = new InMemoryAuthService()
    inMemoryAuthTokensRepository = new InMemoryAuthTokensRepository()
    sut = new TerminateSessionUseCase(inMemoryAuthTokensRepository)
  })

  it("should be able to terminate a user's session", async () => {
    const refreshToken = inMemoryAuthService.generateRefreshToken('user-id')

    const authToken = AuthToken.create({
      userId: new UniqueEntityID('user-id'),
      refreshToken,
      expiresAt: new Date(),
    })
    inMemoryAuthTokensRepository.items.push(authToken)

    const response = await sut.execute({
      userId: 'user-id',
      refreshToken,
    })

    expect(response.isRight()).toBeTruthy()
    expect(inMemoryAuthTokensRepository.items).toHaveLength(0)
  })

  it("should not be able to terminate a user's session from an invalid refresh token", async () => {
    const response = await sut.execute({
      userId: 'user-id',
      refreshToken: 'invalid-refresh-token',
    })

    expect(response.isLeft()).toBeTruthy()
    expect(response.value).toHaveProperty('message', 'Token não encontrado.')
  })

  it('should be able to terminate a session from another user', async () => {
    const refreshToken = inMemoryAuthService.generateRefreshToken('user-1')

    const authToken = AuthToken.create({
      userId: new UniqueEntityID('user-1'),
      refreshToken,
      expiresAt: new Date(),
    })
    inMemoryAuthTokensRepository.items.push(authToken)

    const response = await sut.execute({
      userId: 'user-2',
      refreshToken,
    })

    expect(response.isLeft()).toBeTruthy()
    expect(response.value).toHaveProperty(
      'message',
      'Este token não pertence a este usuário.',
    )
  })
})
