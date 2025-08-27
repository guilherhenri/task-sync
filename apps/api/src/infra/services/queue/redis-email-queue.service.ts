import { Injectable } from '@nestjs/common'

import type { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { EmailQueueService } from '@/domain/email/application/services/email-queue-service'
import type { EmailPriority } from '@/domain/email/enterprise/entities/email-request'
import { WinstonService } from '@/infra/logging/winston.service'
import { MetricsService } from '@/infra/metrics/metrics.service'
import { QueueService } from '@/infra/workers/queue/contracts/queue-service'

interface RedisEmailQueueServiceError extends Error {
  response?: { status: number }
  responseCode?: number
}

@Injectable()
export class RedisEmailQueueService implements EmailQueueService {
  private priorityValue: Record<EmailPriority, number> = {
    urgent: 4,
    high: 3,
    medium: 2,
    low: 1,
  }

  constructor(
    private readonly queueService: QueueService,
    private readonly winston: WinstonService,
    private readonly metrics: MetricsService,
  ) {}

  async enqueueEmailRequest(
    emailRequestId: UniqueEntityID,
    priority: EmailPriority,
  ): Promise<void> {
    const startTime = Date.now()

    try {
      const queue = this.queueService.getEmailQueue()

      await queue.add(
        'send-email',
        { emailRequestId: emailRequestId.toString() },
        { priority: this.priorityValue[priority] },
      )

      this.winston.logExternalApiCall({
        service: 'redis_queue',
        endpoint: '/add',
        method: 'POST',
        statusCode: 200,
        duration: Date.now() - startTime,
        success: true,
      })
      this.metrics.queueJobsTotal.labels('email', 'enqueued', 'success').inc()
      this.metrics.queueOperationDuration
        .labels('email', 'enqueue')
        .observe((Date.now() - startTime) / 1000)

      const waiting = await queue.getWaiting()
      this.metrics.queueSize.labels('email', 'waiting').set(waiting.length)
    } catch (error) {
      this.winston.logExternalApiCall({
        service: 'redis_queue',
        endpoint: '/add',
        method: 'POST',
        statusCode: (error as RedisEmailQueueServiceError)?.response?.status,
        duration: Date.now() - startTime,
        success: false,
        error: (error as RedisEmailQueueServiceError).message,
      })
      this.metrics.queueJobsTotal.labels('email', 'enqueued', 'error').inc()
      this.metrics.queueOperationDuration
        .labels('email', 'enqueue')
        .observe((Date.now() - startTime) / 1000)

      throw error
    }
  }
}
