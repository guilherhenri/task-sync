import { createHash, randomUUID } from 'node:crypto'

import { makeUser } from '@test/factories/make-user'
import { InMemoryUsersRepository } from '@test/repositories/in-memory-users-repository'
import { InMemoryTokenService } from '@test/services/in-memory-token-service'

import { ResetPasswordUseCase } from './reset-password'

let inMemoryUsersRepository: InMemoryUsersRepository
let inMemoryTokenService: InMemoryTokenService
let sut: ResetPasswordUseCase

describe('Reset Password Use-case', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    inMemoryTokenService = new InMemoryTokenService()
    sut = new ResetPasswordUseCase(
      inMemoryUsersRepository,
      inMemoryTokenService,
    )
  })

  it('should be able to reset password from a valid token', async () => {
    const user = await makeUser({ password: '123456' })
    inMemoryUsersRepository.items.push(user)

    const token = randomUUID()
    const tokenHash = createHash('sha256').update(token).digest('hex')
    const key = `password:recovery:${tokenHash}`

    const ttlSeconds = 24 * 60 * 60

    const value = JSON.stringify({
      userId: user.id.toString(),
      expiresAt: new Date(Date.now() + ttlSeconds * 1000).toISOString(),
    })

    inMemoryTokenService.save(key, value, ttlSeconds)

    const response = await sut.execute({ token, newPassword: '654321' })

    expect(response.isRight()).toBeTruthy()
    expect(
      await inMemoryUsersRepository.items[0].verifyPassword('654321'),
    ).toBeTruthy()
    expect(inMemoryTokenService.items.size).toEqual(0)
  })

  it('should not be able to reset password from an invalid token', async () => {
    const user = await makeUser({ password: '123456' })
    inMemoryUsersRepository.items.push(user)

    const response = await sut.execute({
      token: 'invalid-token',
      newPassword: '654321',
    })

    expect(response.isLeft()).toBeTruthy()
    expect(response.value).toHaveProperty('message', 'Token inválido.')
  })

  it('should be able to reset password from a expired token', async () => {
    const user = await makeUser({ password: '123456' })
    inMemoryUsersRepository.items.push(user)

    const token = randomUUID()
    const tokenHash = createHash('sha256').update(token).digest('hex')
    const key = `password:recovery:${tokenHash}`

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

    const response = await sut.execute({ token, newPassword: '654321' })

    expect(response.isLeft()).toBeTruthy()
    expect(response.value).toHaveProperty('message', 'Token expirado.')
    expect(inMemoryTokenService.items.size).toEqual(0)
  })

  it('should be able to reset password for a user does not exist', async () => {
    const token = randomUUID()
    const tokenHash = createHash('sha256').update(token).digest('hex')
    const key = `password:recovery:${tokenHash}`

    const ttlSeconds = 24 * 60 * 60

    const value = JSON.stringify({
      userId: 'user-id',
      expiresAt: new Date(Date.now() + ttlSeconds * 1000).toISOString(),
    })

    inMemoryTokenService.save(key, value, ttlSeconds)

    const response = await sut.execute({ token, newPassword: '654321' })

    expect(response.isLeft()).toBeTruthy()
    expect(response.value).toHaveProperty('message', 'Usuário não encontrado.')
    expect(inMemoryTokenService.items.size).toEqual(0)
  })
})
