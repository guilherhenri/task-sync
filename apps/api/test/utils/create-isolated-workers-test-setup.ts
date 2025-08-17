import { randomUUID } from 'node:crypto'

import type { TestingModuleBuilder } from '@nestjs/testing'
import type { Queue } from 'bull'

import { BullQueueService } from '@/infra/workers/queue/bull/services/bull-queue.service'
import { QueueService } from '@/infra/workers/queue/contracts/queue-service'
import { WorkersModule } from '@/infra/workers/workers.module'

export function createIsolatedWorkersTestSetup() {
  const queueName = `email-queue-${randomUUID()}`

  return {
    queueName,
    setupTestModule(testingModuleBuilder: TestingModuleBuilder) {
      return testingModuleBuilder
        .overrideModule(WorkersModule)
        .useModule(WorkersModule.register({ queueName }))
        .overrideProvider(QueueService)
        .useFactory({
          factory: (emailQueue: Queue) => new BullQueueService(emailQueue),
          inject: [`BullQueue_${queueName}`],
        })
    },
  }
}
