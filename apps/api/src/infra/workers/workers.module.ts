import { BullModule } from '@nestjs/bull'
import { type DynamicModule, Module, type ModuleMetadata } from '@nestjs/common'

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

function createQueues(queueName = 'email-queue'): Array<DynamicModule> {
  return [BullModule.registerQueue({ name: queueName })]
}

const defaultQueues = createQueues()

const workersModuleMetadata: ModuleMetadata = {
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
    ...defaultQueues,
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
  exports: [QueueService, EmailQueueWorker, ...defaultQueues],
}
@Module(workersModuleMetadata)
export class WorkersModule {
  static register(options?: { queueName?: string }): DynamicModule {
    const queueName = options?.queueName ?? 'email-queue'
    const customQueues = createQueues(queueName)

    const {
      imports: workersModuleImports = [],
      exports: workersModuleExports = [],
    } = workersModuleMetadata

    const filteredImports = workersModuleImports.filter(
      (imp) => !defaultQueues.includes(imp as DynamicModule),
    )
    const filteredExports = workersModuleExports.filter(
      (exp) => !defaultQueues.includes(exp as DynamicModule),
    )

    return {
      module: WorkersModule,
      ...workersModuleMetadata,
      imports: [...filteredImports, ...customQueues],
      exports: [...filteredExports, ...customQueues],
    }
  }
}
