import type { UniqueEntityID } from '@/core/entities/unique-entity-id'

import type { EmailPriority } from '../../enterprise/entities/email-request'

export abstract class EmailQueueService {
  abstract enqueueEmailRequest(
    emailRequestId: UniqueEntityID,
    priority: EmailPriority,
  ): Promise<void>
}
