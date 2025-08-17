import type { UniqueEntityID } from '@/core/entities/unique-entity-id'
import type { DomainEvent } from '@/core/events/domain-event'

import type { User } from '../entities/user'

export class PasswordResetEvent implements DomainEvent {
  public ocurredAt: Date
  public user: User

  constructor(user: User) {
    this.user = user
    this.ocurredAt = new Date()
  }

  getAggregateId(): UniqueEntityID {
    return this.user.id
  }
}
