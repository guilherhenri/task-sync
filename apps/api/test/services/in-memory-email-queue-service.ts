import type { UniqueEntityID } from '@/core/entities/unique-entity-id'
import type { EmailQueueService } from '@/domain/email/application/services/email-queue-service'
import type { EmailPriority } from '@/domain/email/enterprise/entities/email-request'

export class InMemoryEmailQueueService implements EmailQueueService {
  public queues: Map<EmailPriority, UniqueEntityID[]> = new Map([
    ['low', []],
    ['medium', []],
    ['high', []],
    ['urgent', []],
  ])

  async enqueueEmailRequest(
    emailRequestId: UniqueEntityID,
    priority: EmailPriority,
  ): Promise<void> {
    const queue = this.queues.get(priority)

    if (!queue) {
      throw new Error(`Invalid priority: ${priority}`)
    }

    queue.push(emailRequestId)
  }

  getQueue(priority: EmailPriority): UniqueEntityID[] {
    return [...(this.queues.get(priority) || [])]
  }

  clearQueue(priority: EmailPriority): void {
    const queue = this.queues.get(priority)

    if (queue) {
      queue.length = 0
    }
  }
}
