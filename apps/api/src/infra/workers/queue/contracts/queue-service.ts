import type { Queue } from 'bull'

export abstract class QueueService {
  abstract getEmailQueue(): Queue
}
