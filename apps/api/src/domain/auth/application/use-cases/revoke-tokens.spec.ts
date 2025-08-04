import { makeUser } from '@test/factories/make-user'
import { makeVerificationToken } from '@test/factories/make-verification-token'
import { InMemoryUsersRepository } from '@test/repositories/in-memory-users-repository'
import { InMemoryVerificationTokensRepository } from '@test/repositories/in-memory-verification-tokens-repository'

import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { RevokeTokensUseCase } from './revoke-tokens'

let inMemoryVerificationTokensRepository: InMemoryVerificationTokensRepository
let inMemoryUsersRepository: InMemoryUsersRepository
let sut: RevokeTokensUseCase

describe('Revoke Tokens Use-case', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    inMemoryVerificationTokensRepository =
      new InMemoryVerificationTokensRepository()
    sut = new RevokeTokensUseCase(inMemoryVerificationTokensRepository)
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

    const response = await sut.execute({ userId: 'user-id' })

    expect(response.isRight()).toBeTruthy()
    expect(inMemoryVerificationTokensRepository.items.size).toEqual(0)
  })
})
