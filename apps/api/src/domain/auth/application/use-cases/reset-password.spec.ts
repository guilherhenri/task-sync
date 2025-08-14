import { FakeHasher } from '@test/cryptography/fake-hasher'
import { makeUser } from '@test/factories/make-user'
import { makeVerificationToken } from '@test/factories/make-verification-token'
import { InMemoryUsersRepository } from '@test/repositories/in-memory-users-repository'
import { InMemoryVerificationTokensRepository } from '@test/repositories/in-memory-verification-tokens-repository'

import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { DomainEvents } from '@/core/events/domain-events'

import { PasswordResetEvent } from '../../enterprise/events/password-reset-event'
import { ResourceGoneError } from './errors/resource-gone'
import { ResourceInvalidError } from './errors/resource-invalid'
import { ResourceNotFoundError } from './errors/resource-not-found'
import { ResetPasswordUseCase } from './reset-password'

let inMemoryUsersRepository: InMemoryUsersRepository
let inMemoryVerificationTokensRepository: InMemoryVerificationTokensRepository
let fakeHasher: FakeHasher
let sut: ResetPasswordUseCase

describe('Reset Password Use-case', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    inMemoryVerificationTokensRepository =
      new InMemoryVerificationTokensRepository()
    fakeHasher = new FakeHasher()
    sut = new ResetPasswordUseCase(
      inMemoryUsersRepository,
      inMemoryVerificationTokensRepository,
      fakeHasher,
    )
  })

  it('should be able to reset password from a valid token', async () => {
    const passwordHash = await fakeHasher.hash('123456')
    const user = makeUser({ passwordHash })
    inMemoryUsersRepository.items.push(user)

    const verificationToken = makeVerificationToken({
      userId: user.id,
      type: 'password:recovery',
    })
    inMemoryVerificationTokensRepository.save(verificationToken)

    const passwordResetEventSpy = jest.fn()
    DomainEvents.register(passwordResetEventSpy, PasswordResetEvent.name)

    const response = await sut.execute({
      token: verificationToken.token,
      newPassword: '654321',
    })

    expect(response.isRight()).toBeTruthy()
    expect(
      await fakeHasher.compare(
        '654321',
        inMemoryUsersRepository.items[0].passwordHash,
      ),
    ).toBeTruthy()
    expect(inMemoryVerificationTokensRepository.items.size).toEqual(0)
    expect(passwordResetEventSpy).toHaveBeenCalled()
  })

  it('should not be able to reset password from a token that does not exist', async () => {
    const response = await sut.execute({
      token: 'invalid-token',
      newPassword: '654321',
    })

    expect(response.isLeft()).toBeTruthy()
    expect(response.value).toBeInstanceOf(ResourceNotFoundError)
    expect(response.value).toHaveProperty('message', 'Token não encontrado.')
  })

  it('should not be able to confirm a email with an invalid token', async () => {
    const user = makeUser()
    inMemoryUsersRepository.items.push(user)

    const verificationToken = makeVerificationToken({
      userId: user.id,
      type: 'password:recovery',
    })
    inMemoryVerificationTokensRepository.save(verificationToken)

    jest
      .spyOn(inMemoryVerificationTokensRepository, 'get')
      .mockImplementation(async () => verificationToken)

    const response = await sut.execute({
      token: 'invalid-token',
      newPassword: '654321',
    })

    expect(response.isLeft()).toBeTruthy()
    expect(response.value).toBeInstanceOf(ResourceInvalidError)
    expect(response.value).toHaveProperty('message', 'Token inválido.')
    expect(inMemoryVerificationTokensRepository.items.size).toEqual(0)
  })

  it('should be able to reset password from a expired token', async () => {
    const user = makeUser()
    inMemoryUsersRepository.items.push(user)

    const oneSecondAgo = new Date(Date.now() - 1000)

    const verificationToken = makeVerificationToken({
      userId: user.id,
      type: 'password:recovery',
      expiresAt: oneSecondAgo,
    })
    inMemoryVerificationTokensRepository.save(verificationToken)

    jest
      .spyOn(inMemoryVerificationTokensRepository, 'get')
      .mockImplementation(async () => verificationToken)

    const response = await sut.execute({
      token: verificationToken.token,
      newPassword: '654321',
    })

    expect(response.isLeft()).toBeTruthy()
    expect(response.value).toBeInstanceOf(ResourceGoneError)
    expect(response.value).toHaveProperty('message', 'Token expirado.')
    expect(inMemoryVerificationTokensRepository.items.size).toEqual(0)
  })

  it('should be able to reset password for a user does not exist', async () => {
    const verificationToken = makeVerificationToken({
      userId: new UniqueEntityID('user-id'),
      type: 'password:recovery',
    })
    inMemoryVerificationTokensRepository.save(verificationToken)

    const response = await sut.execute({
      token: verificationToken.token,
      newPassword: '654321',
    })

    expect(response.isLeft()).toBeTruthy()
    expect(response.value).toBeInstanceOf(ResourceNotFoundError)
    expect(response.value).toHaveProperty('message', 'Usuário não encontrado.')
    expect(inMemoryVerificationTokensRepository.items.size).toEqual(0)
  })
})
