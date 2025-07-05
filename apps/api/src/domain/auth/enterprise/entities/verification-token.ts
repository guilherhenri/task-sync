import { createHash, randomUUID } from 'node:crypto'

import { AggregateRoot } from '@/core/entities/aggregate-root'
import type { UniqueEntityID } from '@/core/entities/unique-entity-id'
import type { DomainEvent } from '@/core/events/domain-event'
import type { Optional } from '@/core/types/optional'

import { EmailUpdateVerificationRequestedEvent } from '../events/email-update-verification-requested-event'
import { EmailVerificationRequestedEvent } from '../events/email-verification-requested-event'
import { PasswordRecoveryRequestedEvent } from '../events/password-recovery-requested-event'
import { PasswordResetEvent } from '../events/password-reset-event'

export type TokenType =
  | 'email:verify'
  | 'email:update:verify'
  | 'password:recovery'
  | 'password:reset'

interface VerificationTokenProps {
  userId: UniqueEntityID
  token: string
  tokenHash: string
  type: TokenType
  expiresAt: Date
}

const eventMap: Record<
  TokenType,
  new (verificationToken: VerificationToken) => DomainEvent
> = {
  'email:verify': EmailVerificationRequestedEvent,
  'email:update:verify': EmailUpdateVerificationRequestedEvent,
  'password:recovery': PasswordRecoveryRequestedEvent,
  'password:reset': PasswordResetEvent,
}

export class VerificationToken extends AggregateRoot<VerificationTokenProps> {
  get userId() {
    return this.props.userId
  }

  get token() {
    return this.props.token
  }

  get tokenHash() {
    return this.props.tokenHash
  }

  get type() {
    return this.props.type
  }

  get expiresAt() {
    return this.props.expiresAt
  }

  /**
   * Verifies if the token is expired.
   * @returns True if the token is expired, false otherwise.
   */
  isExpired() {
    return new Date() > this.props.expiresAt
  }

  /**
   * Verifies if the provided token matches the stored token hash.
   * @param token - The raw token to verify.
   * @returns True if the token matches the stored hash, false otherwise.
   */
  verifyToken(token: string) {
    const tokenHash = createHash('sha256').update(token).digest('hex')

    return this.props.tokenHash === tokenHash
  }

  /**
   * Verifies if the provided token is valid and not expired.
   * @param token - The raw token to verify.
   * @returns True if the token is valid and not expired, false otherwise.
   */
  isValidToken(token: string) {
    return this.verifyToken(token) && !this.isExpired()
  }

  static create(
    props: Optional<
      Omit<VerificationTokenProps, 'token' | 'tokenHash'>,
      'expiresAt'
    >,
    id?: UniqueEntityID,
  ): VerificationToken {
    const token = randomUUID()
    const tokenHash = createHash('sha256').update(token).digest('hex')

    const defaultExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h

    const verificationToken = new VerificationToken(
      {
        ...props,
        token,
        tokenHash,
        expiresAt: props.expiresAt ?? defaultExpiresAt,
      },
      id,
    )

    const isNewToken = !id

    if (isNewToken) {
      verificationToken.addDomainEvent(
        new eventMap[props.type](verificationToken),
      )
    }

    return verificationToken
  }
}
