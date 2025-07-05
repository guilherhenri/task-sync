import type { UniqueEntityID } from '@/core/entities/unique-entity-id'
import type { DomainEvent } from '@/core/events/domain-event'

import type { VerificationToken } from '../entities/verification-token'

export class PasswordResetEvent implements DomainEvent {
  public ocurredAt: Date
  public verificationToken: VerificationToken

  constructor(verificationToken: VerificationToken) {
    this.verificationToken = verificationToken
    this.ocurredAt = new Date()
  }

  getAggregateId(): UniqueEntityID {
    return this.verificationToken.id
  }
}
