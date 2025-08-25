import { makeUser } from '@test/factories/make-user'
import { makeVerificationToken } from '@test/factories/make-verification-token'
import { FakeLogger } from '@test/logging/fake-logger'
import { InMemoryUsersRepository } from '@test/repositories/in-memory-users-repository'
import { InMemoryVerificationTokensRepository } from '@test/repositories/in-memory-verification-tokens-repository'

import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { ConfirmEmailUseCase } from './confirm-email'
import { ResourceGoneError } from './errors/resource-gone'
import { ResourceInvalidError } from './errors/resource-invalid'
import { ResourceNotFoundError } from './errors/resource-not-found'

let inMemoryUsersRepository: InMemoryUsersRepository
let inMemoryVerificationTokensRepository: InMemoryVerificationTokensRepository
let fakeLogger: FakeLogger
let sut: ConfirmEmailUseCase

describe('Confirm Email Use-case', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    inMemoryVerificationTokensRepository =
      new InMemoryVerificationTokensRepository()
    fakeLogger = new FakeLogger()
    sut = new ConfirmEmailUseCase(
      inMemoryUsersRepository,
      inMemoryVerificationTokensRepository,
      fakeLogger,
    )
  })

  it('should be able to confirm a email with a valid token', async () => {
    const user = makeUser()
    inMemoryUsersRepository.items.push(user)

    const verificationToken = makeVerificationToken({
      userId: user.id,
      type: 'email:verify',
    })
    inMemoryVerificationTokensRepository.save(verificationToken)

    const response = await sut.execute({
      token: verificationToken.token,
    })

    expect(response.isRight()).toBeTruthy()
    expect(inMemoryUsersRepository.items[0].emailVerified).toBeTruthy()
    expect(inMemoryVerificationTokensRepository.items.size).toEqual(0)
  })

  it('should be able to confirm a updated email with a valid token', async () => {
    const user = makeUser()
    inMemoryUsersRepository.items.push(user)

    const verificationToken = makeVerificationToken({
      userId: user.id,
      type: 'email:update:verify',
    })
    inMemoryVerificationTokensRepository.save(verificationToken)

    const response = await sut.execute({
      token: verificationToken.token,
    })

    expect(response.isRight()).toBeTruthy()
    expect(inMemoryUsersRepository.items[0].emailVerified).toBeTruthy()
    expect(inMemoryVerificationTokensRepository.items.size).toEqual(0)
  })

  it('should not be able to confirm a email with a token that does not exist', async () => {
    const response = await sut.execute({
      token: 'invalid-token',
    })

    expect(response.isLeft()).toBeTruthy()
    expect(response.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to confirm a email with an invalid token', async () => {
    const user = makeUser()
    inMemoryUsersRepository.items.push(user)

    const verificationToken = makeVerificationToken({
      userId: user.id,
      type: 'email:verify',
    })

    jest
      .spyOn(inMemoryVerificationTokensRepository, 'get')
      .mockImplementation(async () => verificationToken)

    const response = await sut.execute({
      token: 'invalid-token',
    })

    expect(response.isLeft()).toBeTruthy()
    expect(response.value).toBeInstanceOf(ResourceInvalidError)
    expect(inMemoryUsersRepository.items[0].emailVerified).toBeFalsy()
  })

  it('should not be able to confirm a email with a expired token', async () => {
    const user = makeUser()
    inMemoryUsersRepository.items.push(user)

    const oneSecondAgo = new Date(Date.now() - 1000)

    const verificationToken = makeVerificationToken({
      userId: user.id,
      type: 'email:verify',
      expiresAt: oneSecondAgo,
    })
    inMemoryVerificationTokensRepository.save(verificationToken)

    jest
      .spyOn(inMemoryVerificationTokensRepository, 'get')
      .mockImplementation(async () => verificationToken)

    const response = await sut.execute({
      token: verificationToken.token,
    })

    expect(response.isLeft()).toBeTruthy()
    expect(response.value).toBeInstanceOf(ResourceGoneError)
    expect(inMemoryUsersRepository.items[0].emailVerified).toBeFalsy()
  })

  it('should not be able to confirm an email from a user that does not exist', async () => {
    const verificationToken = makeVerificationToken({
      userId: new UniqueEntityID('user-id'),
    })
    inMemoryVerificationTokensRepository.save(verificationToken)

    const response = await sut.execute({
      token: verificationToken.token,
    })

    expect(response.isLeft()).toBeTruthy()
    expect(response.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
