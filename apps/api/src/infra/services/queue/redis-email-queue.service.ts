import { Injectable } from '@nestjs/common'

import type { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { EmailQueueService } from '@/domain/email/application/services/email-queue-service'
import type { EmailPriority } from '@/domain/email/enterprise/entities/email-request'
import { QueueService } from '@/infra/workers/queue/contracts/queue-service'

@Injectable()
export class RedisEmailQueueService implements EmailQueueService {
  private priorityValue: Record<EmailPriority, number> = {
    urgent: 4,
    high: 3,
    medium: 2,
    low: 1,
  }

  constructor(private readonly queueService: QueueService) {}

  async enqueueEmailRequest(
    emailRequestId: UniqueEntityID,
    priority: EmailPriority,
  ): Promise<void> {
    const queue = this.queueService.getEmailQueue()

    await queue.add(
      'send-email',
      { emailRequestId: emailRequestId.toString() },
      { priority: this.priorityValue[priority] },
    )
  }
}
