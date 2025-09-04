import { makeAuthToken } from '@test/factories/make-auth-token'
import { makeUser } from '@test/factories/make-user'
import { makeVerificationToken } from '@test/factories/make-verification-token'
import { FakeLogger } from '@test/logging/fake-logger'
import { FakeMetrics } from '@test/metrics/fake-metrics'
import { InMemoryAuthTokensRepository } from '@test/repositories/in-memory-auth-tokens-repository'
import { InMemoryUsersRepository } from '@test/repositories/in-memory-users-repository'
import { InMemoryVerificationTokensRepository } from '@test/repositories/in-memory-verification-tokens-repository'

import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { RevokeTokensUseCase } from './revoke-tokens'

let inMemoryUsersRepository: InMemoryUsersRepository
let inMemoryAuthTokensRepository: InMemoryAuthTokensRepository
let inMemoryVerificationTokensRepository: InMemoryVerificationTokensRepository
let fakeLogger: FakeLogger
let fakeMetrics: FakeMetrics
let sut: RevokeTokensUseCase

describe('Revoke Tokens Use-case', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    inMemoryAuthTokensRepository = new InMemoryAuthTokensRepository()
    inMemoryVerificationTokensRepository =
      new InMemoryVerificationTokensRepository()
    fakeLogger = new FakeLogger()
    fakeMetrics = new FakeMetrics()
    sut = new RevokeTokensUseCase(
      inMemoryAuthTokensRepository,
      inMemoryVerificationTokensRepository,
      fakeLogger,
      fakeMetrics,
    )
  })

  it('should be able to revoke all tokens from a user', async () => {
    const user = makeUser({}, new UniqueEntityID('user-id'))
    inMemoryUsersRepository.items.push(user)

    const verificationToken1 = makeVerificationToken({
      userId: user.id,
      type: 'email:verify',
    })
    const verificationToken2 = makeVerificationToken({
      userId: user.id,
      type: 'password:recovery',
    })

    inMemoryVerificationTokensRepository.save(verificationToken1)
    inMemoryVerificationTokensRepository.save(verificationToken2)

    const authToken = await makeAuthToken({
      userId: user.id,
    })
    inMemoryAuthTokensRepository.create(authToken)

    const response = await sut.execute({ userId: 'user-id' })

    expect(response.isRight()).toBeTruthy()
    expect(inMemoryVerificationTokensRepository.items.size).toEqual(0)
    expect(inMemoryAuthTokensRepository.items).toHaveLength(0)
  })
})
