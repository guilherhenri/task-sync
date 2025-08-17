import type { Job } from 'bull'

export type EmailQueueWorkerJob = Job<{
  emailRequestId: string
}>

export abstract class EmailQueueWorker {
  abstract handle(job: EmailQueueWorkerJob): Promise<void>
}
