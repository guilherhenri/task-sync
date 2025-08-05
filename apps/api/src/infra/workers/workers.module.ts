import { BullModule } from '@nestjs/bull'
import { type DynamicModule, Module } from '@nestjs/common'

import { GetEmailRequestByIdUseCase } from '@/domain/email/application/use-cases/get-email-request-by-id'
import { UpdateEmailRequestStatusUseCase } from '@/domain/email/application/use-cases/update-email-request-status'

import { DatabaseModule } from '../database/database.module'
import { EmailModule } from '../email/email.module'
import { EnvModule } from '../env/env.module'
import { EnvService } from '../env/env.service'
import { KeyValueModule } from '../key-value/key-value.module'
import { BullQueueService } from './queue/bull/services/bull-queue.service'
import { BullEmailQueueWorker } from './queue/bull/workers/bull-email-queue.worker'
import { EmailQueueWorker } from './queue/contracts/email-queue-worker'
import { QueueService } from './queue/contracts/queue-service'

const queues: Array<DynamicModule> = [
  BullModule.registerQueue({ name: 'email-queue' }),
]

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [EnvModule],
      useFactory: (config: EnvService) => ({
        redis: {
          host: config.get('REDIS_HOST'),
          port: config.get('REDIS_PORT'),
          db: config.get('REDIS_DB'),
        },
      }),
      inject: [EnvService],
    }),
    ...queues,
    DatabaseModule,
    KeyValueModule,
    EmailModule,
  ],
  providers: [
    {
      provide: QueueService,
      useClass: BullQueueService,
    },
    {
      provide: EmailQueueWorker,
      useClass: BullEmailQueueWorker,
    },
    UpdateEmailRequestStatusUseCase,
    GetEmailRequestByIdUseCase,
  ],
  exports: [QueueService, EmailQueueWorker, ...queues],
})
export class WorkersModule {}
