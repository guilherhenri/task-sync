import { FakeHasher } from '@test/cryptography/fake-hasher'
import { makeUser } from '@test/factories/make-user'
import { FakeLogger } from '@test/logging/fake-logger'
import { FakeMetrics } from '@test/metrics/fake-metrics'
import { InMemoryUsersRepository } from '@test/repositories/in-memory-users-repository'
import { InMemoryVerificationTokensRepository } from '@test/repositories/in-memory-verification-tokens-repository'

import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { DomainEvents } from '@/core/events/domain-events'

import { EmailUpdateVerificationRequestedEvent } from '../../enterprise/events/email-update-verification-requested-event'
import { EmailAlreadyInUseError } from './errors/email-already-in-use'
import { ResourceNotFoundError } from './errors/resource-not-found'
import { RefineProfileUseCase } from './refine-profile'

let inMemoryUsersRepository: InMemoryUsersRepository
let inMemoryVerificationTokensRepository: InMemoryVerificationTokensRepository
let fakeHasher: FakeHasher
let fakeLogger: FakeLogger
let fakeMetrics: FakeMetrics
let sut: RefineProfileUseCase

describe('Refine Profile Use-case', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    inMemoryVerificationTokensRepository =
      new InMemoryVerificationTokensRepository()
    fakeHasher = new FakeHasher()
    fakeLogger = new FakeLogger()
    fakeMetrics = new FakeMetrics()
    sut = new RefineProfileUseCase(
      inMemoryUsersRepository,
      inMemoryVerificationTokensRepository,
      fakeHasher,
      fakeLogger,
      fakeMetrics,
    )
  })

  it('should be able to update a valid user', async () => {
    const passwordHash = await fakeHasher.hash('123456')

    const user = makeUser({
      name: 'Test Name',
      email: 'example@email.com',
      passwordHash,
    })
    inMemoryUsersRepository.items.push(user)

    const emailUpdateVerificationRequestedEventSpy = jest.fn()
    DomainEvents.register(
      emailUpdateVerificationRequestedEventSpy,
      EmailUpdateVerificationRequestedEvent.name,
    )

    const response = await sut.execute({
      userId: user.id.toString(),
      name: 'Updated Name',
      email: 'updated@email.com',
      newPassword: '654321',
    })

    expect(response.isRight()).toBeTruthy()
    expect(inMemoryUsersRepository.items[0]).toEqual(
      expect.objectContaining({
        name: 'Updated Name',
        email: 'updated@email.com',
      }),
    )
    expect(
      await fakeHasher.compare(
        '654321',
        inMemoryUsersRepository.items[0].passwordHash,
      ),
    ).toBeTruthy()
    expect(inMemoryVerificationTokensRepository.items.size).toEqual(1)

    expect(emailUpdateVerificationRequestedEventSpy).toHaveBeenCalled()
  })

  it('should be able to update a user without change the password', async () => {
    const passwordHash = await fakeHasher.hash('123456')

    const user = makeUser({
      name: 'Test Name',
      email: 'example@email.com',
      passwordHash,
    })
    inMemoryUsersRepository.items.push(user)

    const response = await sut.execute({
      userId: user.id.toString(),
      name: 'Updated Name',
      email: 'updated@email.com',
    })

    expect(response.isRight()).toBeTruthy()
    expect(inMemoryUsersRepository.items[0]).toEqual(
      expect.objectContaining({
        name: 'Updated Name',
        email: 'updated@email.com',
      }),
    )
    expect(await fakeHasher.compare('123456', user.passwordHash)).toBeTruthy()
  })

  it('should not be able to reset email verification when the email is same', async () => {
    const passwordHash = await fakeHasher.hash('123456')

    const user = makeUser({
      name: 'Test Name',
      email: 'example@email.com',
      passwordHash,
      emailVerified: true,
    })
    inMemoryUsersRepository.items.push(user)

    const response = await sut.execute({
      userId: user.id.toString(),
      name: 'Updated Name',
      email: 'example@email.com',
    })

    expect(response.isRight()).toBeTruthy()
    expect(inMemoryUsersRepository.items[0].emailVerified).toBeTruthy()
  })

  it('should not be able to update an invalid user', async () => {
    const response = await sut.execute({
      userId: 'user-1',
      name: 'Updated Name',
      email: 'updated@email.com',
    })

    expect(response.isLeft()).toBeTruthy()
    expect(response.value).toBeInstanceOf(ResourceNotFoundError)
    expect(response.value).toHaveProperty('message', 'Usuário não encontrado.')
  })

  it('should not be able to update a user with an email that is already in use', async () => {
    const user1 = makeUser(
      {
        email: 'user1@email.com',
      },
      new UniqueEntityID('user-1'),
    )
    const user2 = makeUser(
      {
        email: 'user2@email.com',
      },
      new UniqueEntityID('user-2'),
    )
    inMemoryUsersRepository.items.push(user1)
    inMemoryUsersRepository.items.push(user2)

    const response = await sut.execute({
      userId: 'user-1',
      name: 'Updated Name',
      email: 'user2@email.com',
    })

    expect(response.isLeft()).toBeTruthy()
    expect(response.value).toBeInstanceOf(EmailAlreadyInUseError)
    expect(response.value).toHaveProperty(
      'message',
      `O e-mail "user2@email.com" já está em uso.`,
    )
    expect(inMemoryUsersRepository.items[0].email).toEqual('user1@email.com')
  })
})
