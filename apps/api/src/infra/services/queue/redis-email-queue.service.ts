import { Injectable } from '@nestjs/common'

import type { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { EmailQueueService } from '@/domain/email/application/services/email-queue-service'
import type { EmailPriority } from '@/domain/email/enterprise/entities/email-request'
import { ObservableQueueService } from '@/infra/observability/observable-queue-service'
import { QueueService } from '@/infra/workers/queue/contracts/queue-service'

@Injectable()
export class RedisEmailQueueService
  extends ObservableQueueService
  implements EmailQueueService
{
  private priorityValue: Record<EmailPriority, number> = {
    urgent: 4,
    high: 3,
    medium: 2,
    low: 1,
  }

  constructor(private readonly queueService: QueueService) {
    super()
  }

  async enqueueEmailRequest(
    emailRequestId: UniqueEntityID,
    priority: EmailPriority,
  ): Promise<void> {
    await this.trackOperation(
      async () => {
        const queue = this.queueService.getEmailQueue()

        await queue.add(
          'send-email',
          { emailRequestId: emailRequestId.toString() },
          { priority: this.priorityValue[priority] },
        )

        const waiting = await queue.getWaiting()

        this.queueSize = waiting.length
      },
      {
        service: 'redis_queue',
        endpoint: '/add',
        method: 'POST',
        queue: 'email',
        operation: 'enqueued',
      },
    )
  }
}
