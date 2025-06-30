import { makeUser } from '@test/factories/make-user'
import { InMemoryUsersRepository } from '@test/repositories/in-memory-users-repository'
import { InMemoryTokenService } from '@test/services/in-memory-token-service'
import { createHash, randomUUID } from 'crypto'

import { ConfirmEmailUseCase } from './confirm-email'

let inMemoryUsersRepository: InMemoryUsersRepository
let inMemoryTokenService: InMemoryTokenService
let sut: ConfirmEmailUseCase

describe('Confirm Email Use-case', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    inMemoryTokenService = new InMemoryTokenService()
    sut = new ConfirmEmailUseCase(inMemoryUsersRepository, inMemoryTokenService)
  })

  it("should be able to confirm a user's email with a valid token", async () => {
    const user = await makeUser()
    inMemoryUsersRepository.items.push(user)

    const token = randomUUID()
    const tokenHash = createHash('sha256').update(token).digest('hex')
    const key = `email:verify:${tokenHash}`

    const twentyFourHoursInSeconds = 24 * 60 * 60

    const value = JSON.stringify({
      userId: user.id.toString(),
      expiresAt: new Date(
        Date.now() + twentyFourHoursInSeconds * 1000,
      ).toISOString(),
    })

    inMemoryTokenService.save(key, value, twentyFourHoursInSeconds)

    const response = await sut.execute({
      token,
    })

    expect(response.isRight()).toBeTruthy()
    expect(inMemoryUsersRepository.items[0].emailVerified).toBeTruthy()
  })

  it("should not be able to confirm a user's email with a invalid token", async () => {
    const user = await makeUser()
    inMemoryUsersRepository.items.push(user)

    const token = randomUUID()
    const tokenHash = createHash('sha256').update(token).digest('hex')
    const key = `email:verify:${tokenHash}`

    const twentyFourHoursInSeconds = 24 * 60 * 60

    const value = JSON.stringify({
      userId: user.id.toString(),
      expiresAt: new Date(
        Date.now() + twentyFourHoursInSeconds * 1000,
      ).toISOString(),
    })

    inMemoryTokenService.save(key, value, twentyFourHoursInSeconds)

    const response = await sut.execute({
      token: 'invalid-token',
    })

    expect(response.isLeft()).toBeTruthy()
    expect(response.value).toHaveProperty('message', 'Token inválido.')
    expect(inMemoryUsersRepository.items[0].emailVerified).toBeFalsy()
  })

  it("should not be able to confirm a user's email with a expired token", async () => {
    const user = await makeUser()
    inMemoryUsersRepository.items.push(user)

    const token = randomUUID()
    const tokenHash = createHash('sha256').update(token).digest('hex')
    const key = `email:verify:${tokenHash}`

    const ttlSeconds = 1

    const value = JSON.stringify({
      userId: user.id.toString(),
      expiresAt: new Date(Date.now() + ttlSeconds * 1000).toISOString(),
    })

    inMemoryTokenService.save(key, value, ttlSeconds)

    await new Promise((resolve) => setTimeout(resolve, 1000))

    jest
      .spyOn(inMemoryTokenService, 'get')
      .mockImplementation(async () => value)

    const response = await sut.execute({
      token,
    })

    expect(response.isLeft()).toBeTruthy()
    expect(response.value).toHaveProperty('message', 'Token expirado.')
    expect(inMemoryUsersRepository.items[0].emailVerified).toBeFalsy()
  })

  it('should not be able to confirm an email from a user that does not exist', async () => {
    const token = randomUUID()
    const tokenHash = createHash('sha256').update(token).digest('hex')
    const key = `email:verify:${tokenHash}`

    const twentyFourHoursInSeconds = 24 * 60 * 60

    const value = JSON.stringify({
      userId: 'user-1',
      expiresAt: new Date(
        Date.now() + twentyFourHoursInSeconds * 1000,
      ).toISOString(),
    })

    inMemoryTokenService.save(key, value, twentyFourHoursInSeconds)

    const response = await sut.execute({
      token,
    })

    expect(response.isLeft()).toBeTruthy()
    expect(response.value).toHaveProperty('message', 'Usuário não encontrado.')
  })
})
