import { FakeEncryptor } from '@test/cryptography/fake-encryptor'
import { FakeLogger } from '@test/logging/fake-logger'
import { FakeMetrics } from '@test/metrics/fake-metrics'
import { InMemoryAuthTokensRepository } from '@test/repositories/in-memory-auth-tokens-repository'

import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { AuthToken } from '../../enterprise/entities/auth-token'
import { TerminateSessionUseCase } from './terminate-session'

let inMemoryAuthTokensRepository: InMemoryAuthTokensRepository
let fakeEncryptor: FakeEncryptor
let fakeLogger: FakeLogger
let fakeMetrics: FakeMetrics
let sut: TerminateSessionUseCase

describe('Terminate Session Use-case', () => {
  beforeEach(() => {
    inMemoryAuthTokensRepository = new InMemoryAuthTokensRepository()
    fakeLogger = new FakeLogger()
    fakeMetrics = new FakeMetrics()
    sut = new TerminateSessionUseCase(
      inMemoryAuthTokensRepository,
      fakeLogger,
      fakeMetrics,
    )
    fakeEncryptor = new FakeEncryptor()
  })

  it("should be able to terminate a user's session", async () => {
    const refreshToken = await fakeEncryptor.encrypt({ sub: 'user-id' })

    const authToken = AuthToken.create({
      userId: new UniqueEntityID('user-id'),
      refreshToken,
      expiresAt: new Date(),
    })
    inMemoryAuthTokensRepository.items.push(authToken)

    const response = await sut.execute({
      userId: 'user-id',
    })

    expect(response.isRight()).toBeTruthy()
    expect(inMemoryAuthTokensRepository.items).toHaveLength(0)
  })

  it('should always return success even if the refresh token does not exist', async () => {
    const response = await sut.execute({
      userId: 'user-id',
    })

    expect(response.isRight()).toBeTruthy()
  })
})
