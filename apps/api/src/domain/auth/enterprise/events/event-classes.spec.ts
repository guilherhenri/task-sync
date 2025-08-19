import { makeUser } from '@test/factories/make-user'
import { makeVerificationToken } from '@test/factories/make-verification-token'

import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import type { DomainEvent } from '@/core/events/domain-event'

import { EmailUpdateVerificationRequestedEvent } from './email-update-verification-requested-event'
import { EmailVerificationRequestedEvent } from './email-verification-requested-event'
import { PasswordRecoveryRequestedEvent } from './password-recovery-requested-event'
import { PasswordResetEvent } from './password-reset-event'
import { UserRegisteredEvent } from './user-registered-event'

const eventClasses: Array<{ name: string; instance: () => DomainEvent }> = [
  {
    name: EmailUpdateVerificationRequestedEvent.name,
    instance: () =>
      new EmailUpdateVerificationRequestedEvent(
        makeVerificationToken({ type: 'email:update:verify' }),
      ),
  },
  {
    name: EmailVerificationRequestedEvent.name,
    instance: () =>
      new EmailVerificationRequestedEvent(
        makeVerificationToken({ type: 'email:verify' }),
      ),
  },
  {
    name: PasswordRecoveryRequestedEvent.name,
    instance: () =>
      new PasswordRecoveryRequestedEvent(
        makeVerificationToken({ type: 'password:recovery' }),
      ),
  },
  {
    name: PasswordResetEvent.name,
    instance: () => new PasswordResetEvent(makeUser()),
  },
  {
    name: UserRegisteredEvent.name,
    instance: () => new UserRegisteredEvent(makeUser()),
  },
]

describe('Domain Events', () => {
  eventClasses.forEach(({ name, instance }) => {
    it(`should implement getAggregateId correctly for ${name}`, () => {
      const event = instance()
      expect(event.getAggregateId()).toBeInstanceOf(UniqueEntityID)
    })
  })
})
