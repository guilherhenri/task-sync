import { FakeHasher } from '@test/cryptography/fake-hasher'
import { makeUser } from '@test/factories/make-user'
import { FakeLogger } from '@test/logging/fake-logger'
import { FakeMetrics } from '@test/metrics/fake-metrics'
import { InMemoryUsersRepository } from '@test/repositories/in-memory-users-repository'
import { InMemoryVerificationTokensRepository } from '@test/repositories/in-memory-verification-tokens-repository'

import { DomainEvents } from '@/core/events/domain-events'

import { EmailVerificationRequestedEvent } from '../../enterprise/events/email-verification-requested-event'
import { UserRegisteredEvent } from '../../enterprise/events/user-registered-event'
import { EnrollIdentityUseCase } from './enroll-identity'
import { EmailAlreadyInUseError } from './errors/email-already-in-use'

let inMemoryUsersRepository: InMemoryUsersRepository
let inMemoryVerificationTokensRepository: InMemoryVerificationTokensRepository
let fakeHasher: FakeHasher
let fakeLogger: FakeLogger
let fakeMetrics: FakeMetrics
let sut: EnrollIdentityUseCase

describe('Enroll Identity Use-case', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    inMemoryVerificationTokensRepository =
      new InMemoryVerificationTokensRepository()
    fakeHasher = new FakeHasher()
    fakeLogger = new FakeLogger()
    fakeMetrics = new FakeMetrics()
    sut = new EnrollIdentityUseCase(
      inMemoryUsersRepository,
      inMemoryVerificationTokensRepository,
      fakeHasher,
      fakeLogger,
      fakeMetrics,
    )
  })

  it('should be able to enroll identity', async () => {
    const userRegisteredEventSpy = jest.fn()
    const emailVerificationRequestedEventSpy = jest.fn()

    DomainEvents.register(userRegisteredEventSpy, UserRegisteredEvent.name)
    DomainEvents.register(
      emailVerificationRequestedEventSpy,
      EmailVerificationRequestedEvent.name,
    )

    const response = await sut.execute({
      name: 'Name Test',
      email: 'example@email.com',
      password: '123456',
    })

    expect(response.isRight()).toBeTruthy()

    if (response.isRight()) {
      const { user } = response.value
      expect(user.email).toEqual('example@email.com')
      expect(inMemoryUsersRepository.items[0].id).toEqual(user.id)
    }

    expect(inMemoryVerificationTokensRepository.items.size).toEqual(1)

    expect(userRegisteredEventSpy).toHaveBeenCalled()
    expect(emailVerificationRequestedEventSpy).toHaveBeenCalled()
  })

  it('should not be able to enroll identity with an email that is already in use', async () => {
    const user = makeUser({ email: 'example@email.com' })
    inMemoryUsersRepository.items.push(user)

    const response = await sut.execute({
      name: 'Name Test',
      email: 'example@email.com',
      password: '123456',
    })

    expect(response.isLeft()).toBeTruthy()
    expect(response.value).toBeInstanceOf(EmailAlreadyInUseError)
    expect(response.value).toHaveProperty(
      'message',
      `O e-mail "example@email.com" já está em uso.`,
    )
  })

  it('should be able to hash password automatically', async () => {
    const response = await sut.execute({
      name: 'Name Test',
      email: 'example@email.com',
      password: '123456',
    })

    if (response.isRight()) {
      const { user } = response.value
      expect(user.passwordHash).not.toEqual('123456')
      expect(await fakeHasher.compare('123456', user.passwordHash)).toBeTruthy()
    }
  })
})
