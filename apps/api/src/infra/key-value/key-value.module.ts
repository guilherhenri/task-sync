import { Module } from '@nestjs/common'

import { AuthTokensRepository } from '@/domain/auth/application/repositories/auth-tokens-repository'
import { VerificationTokensRepository } from '@/domain/auth/application/repositories/verification-tokens-repository'

import { EnvModule } from '../env/env.module'
import { MetricsModule } from '../metrics/metrics.module'
import { KeyValuesRepository } from './key-values-repository'
import { RedisService } from './redis/redis.service'
import { RedisAuthTokensRepository } from './redis/repositories/redis-auth-tokens-repository'
import { RedisKeyValueRepository } from './redis/repositories/redis-key-values-repository'
import { RedisVerificationTokensRepository } from './redis/repositories/redis-verification-tokens-repository'

@Module({
  imports: [EnvModule, MetricsModule],
  providers: [
    RedisService,
    {
      provide: AuthTokensRepository,
      useClass: RedisAuthTokensRepository,
    },
    {
      provide: VerificationTokensRepository,
      useClass: RedisVerificationTokensRepository,
    },
    {
      provide: KeyValuesRepository,
      useClass: RedisKeyValueRepository,
    },
  ],
  exports: [
    RedisService,
    AuthTokensRepository,
    VerificationTokensRepository,
    KeyValuesRepository,
  ],
})
export class KeyValueModule {}
