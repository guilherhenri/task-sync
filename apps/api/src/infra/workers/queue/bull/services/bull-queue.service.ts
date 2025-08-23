import { InjectQueue } from '@nestjs/bull'
import { Injectable } from '@nestjs/common'
import type { Queue } from 'bull'

import { QueueService } from '../../contracts/queue-service'

@Injectable()
export class BullQueueService implements QueueService {
  private readonly emailQueue: Queue

  constructor(@InjectQueue('email-queue') emailQueue: Queue) {
    this.emailQueue = emailQueue
  }

  getEmailQueue(): Queue {
    return this.emailQueue
  }
}
