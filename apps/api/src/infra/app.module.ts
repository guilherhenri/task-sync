import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis'
import { Module } from '@nestjs/common'
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'

import { AuthModule } from './auth/auth.module'
import { EnvModule } from './env/env.module'
import { EventsModule } from './events/events.module'
import { HttpModule } from './http/http.module'
import { KeyValueModule } from './key-value/key-value.module'
import { RedisService } from './key-value/redis/redis.service'
import { ThrottlerExceptionFilter } from './logging/filters/throttler-exception.filter'
import { ErrorLoggingInterceptor } from './logging/interceptors/error-logging.interceptor'
import { LoggingInterceptor } from './logging/interceptors/logging.interceptor'
import { LoggingModule } from './logging/logging.module'
import { WorkersModule } from './workers/workers.module'

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [EnvModule, KeyValueModule],
      inject: [RedisService],
      useFactory: (redisService: RedisService) => ({
        throttlers: [
          {
            ttl: 60000,
            limit: 100,
          },
        ],
        storage: new ThrottlerStorageRedisService(redisService),
      }),
    }),
    LoggingModule,
    AuthModule,
    HttpModule,
    EnvModule,
    EventsModule,
    WorkersModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: ThrottlerExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ErrorLoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
