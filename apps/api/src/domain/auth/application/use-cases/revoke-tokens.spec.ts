import { makeUser } from '@test/factories/make-user'
import { InMemoryUsersRepository } from '@test/repositories/in-memory-users-repository'
import { InMemoryTokenService } from '@test/services/in-memory-token-service'
import { createHash, randomUUID } from 'crypto'

import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { RevokeTokensUseCase } from './revoke-tokens'

let inMemoryTokenService: InMemoryTokenService
let inMemoryUsersRepository: InMemoryUsersRepository
let sut: RevokeTokensUseCase

describe('Revoke Tokens Use-case', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    inMemoryTokenService = new InMemoryTokenService()
    sut = new RevokeTokensUseCase(inMemoryTokenService)
  })

  it('should be able to revoke all tokens from a user', async () => {
    const user = await makeUser({}, new UniqueEntityID('user-id'))
    inMemoryUsersRepository.items.push(user)

    const token = randomUUID()
    const tokenHash = createHash('sha256').update(token).digest('hex')
    const key1 = `email:verify:${tokenHash}`
    const key2 = `password:recovery:${tokenHash}`

    const twentyFourHoursInSeconds = 24 * 60 * 60

    const value = JSON.stringify({
      userId: 'user-id',
      expiresAt: new Date(
        Date.now() + twentyFourHoursInSeconds * 1000,
      ).toISOString(),
    })

    inMemoryTokenService.save(key1, value, twentyFourHoursInSeconds)
    inMemoryTokenService.save(key2, value, twentyFourHoursInSeconds)

    const response = await sut.execute({ userId: 'user-id' })

    expect(response.isRight()).toBeTruthy()
    expect(inMemoryTokenService.items.size).toEqual(0)
  })
})
