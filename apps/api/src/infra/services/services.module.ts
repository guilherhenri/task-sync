import { Module } from '@nestjs/common'

import { AuthUserService } from '@/domain/auth/application/services/auth-user-service'
import { EmailQueueService } from '@/domain/email/application/services/email-queue-service'

import { DatabaseModule } from '../database/database.module'
import { KeyValueModule } from '../key-value/key-value.module'
import { ObservabilityModule } from '../observability/observability.module'
import { WorkersModule } from '../workers/workers.module'
import { InfraAuthUserService } from './data/infra-auth-user.service'
import { RedisEmailQueueService } from './queue/redis-email-queue.service'

@Module({
  imports: [DatabaseModule, KeyValueModule, WorkersModule, ObservabilityModule],
  providers: [
    {
      provide: AuthUserService,
      useClass: InfraAuthUserService,
    },
    {
      provide: EmailQueueService,
      useClass: RedisEmailQueueService,
    },
  ],
  exports: [AuthUserService, EmailQueueService],
})
export class ServicesModule {}
