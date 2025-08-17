import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { EmailVerificationRequestedEvent } from '../events/email-verification-requested-event'
import { VerificationToken } from './verification-token'

it('should be able to create a verification token', () => {
  const verificationToken = VerificationToken.create({
    userId: new UniqueEntityID('user-id'),
    type: 'email:verify',
  })

  expect(verificationToken.id).toBeInstanceOf(UniqueEntityID)
  expect(verificationToken.userId.toString()).toEqual('user-id')
  expect(verificationToken.type).toEqual('email:verify')
  expect(verificationToken.token).not.toBeNaN()
  expect(verificationToken.tokenHash).not.toBeNaN()
  expect(verificationToken.expiresAt).toBeInstanceOf(Date)

  expect(verificationToken.domainEvents).toHaveLength(1)
  expect(verificationToken.domainEvents[0]).toBeInstanceOf(
    EmailVerificationRequestedEvent,
  )

  expect(verificationToken.isExpired()).toBeFalsy()
  expect(verificationToken.verifyToken(verificationToken.token)).toBeTruthy()
  expect(verificationToken.isValidToken(verificationToken.token)).toBeTruthy()
})

it('should not be able to add a event for a token that is not new', () => {
  const verificationToken = VerificationToken.create(
    {
      userId: new UniqueEntityID('user-id'),
      type: 'email:verify',
    },
    new UniqueEntityID('token-id'),
  )

  expect(verificationToken.id.toString()).toEqual('token-id')
  expect(verificationToken.domainEvents).toHaveLength(0)
})
