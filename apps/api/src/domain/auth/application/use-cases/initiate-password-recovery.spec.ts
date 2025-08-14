import { makeUser } from '@test/factories/make-user'
import { InMemoryUsersRepository } from '@test/repositories/in-memory-users-repository'
import { InMemoryVerificationTokensRepository } from '@test/repositories/in-memory-verification-tokens-repository'

import { DomainEvents } from '@/core/events/domain-events'

import { PasswordRecoveryRequestedEvent } from '../../enterprise/events/password-recovery-requested-event'
import { InitiatePasswordRecoveryUseCase } from './initiate-password-recovery'

let inMemoryUsersRepository: InMemoryUsersRepository
let inMemoryVerificationTokensRepository: InMemoryVerificationTokensRepository
let sut: InitiatePasswordRecoveryUseCase

describe('Initiate Password Recovery Use-case', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    inMemoryVerificationTokensRepository =
      new InMemoryVerificationTokensRepository()
    sut = new InitiatePasswordRecoveryUseCase(
      inMemoryUsersRepository,
      inMemoryVerificationTokensRepository,
    )
  })

  it('should be able to initialize password recovery for a valid email', async () => {
    const user = makeUser({ email: 'example@email.com' })
    user.verifyEmail()
    inMemoryUsersRepository.items.push(user)

    const passwordRecoveryRequestedEventSpy = jest.fn()
    DomainEvents.register(
      passwordRecoveryRequestedEventSpy,
      PasswordRecoveryRequestedEvent.name,
    )

    const response = await sut.execute({ email: 'example@email.com' })

    expect(response.isRight()).toBeTruthy()
    expect(inMemoryVerificationTokensRepository.items.size).toEqual(1)

    expect(passwordRecoveryRequestedEventSpy).toHaveBeenCalled()
  })

  it('should not be able to initialize password recovery for an unverified email', async () => {
    const user = makeUser({ email: 'example@email.com' })
    inMemoryUsersRepository.items.push(user)

    const response = await sut.execute({ email: 'example@email.com' })

    expect(response.isLeft()).toBeTruthy()
    expect(response.value).toHaveProperty(
      'message',
      'Este endereço de e-mail ainda não foi verificado, por favor cheque seu e-mail.',
    )
    expect(inMemoryVerificationTokensRepository.items.size).toEqual(0)
  })

  it('should not be able to initialize password recovery for an invalid email and not return an error', async () => {
    const response = await sut.execute({ email: 'example@email.com' })

    expect(response.isRight()).toBeTruthy()
    expect(inMemoryVerificationTokensRepository.items.size).toEqual(0)
  })
})
