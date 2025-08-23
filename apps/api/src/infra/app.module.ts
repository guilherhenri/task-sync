import { Module } from '@nestjs/common'
import { APP_INTERCEPTOR } from '@nestjs/core'

import { AuthModule } from './auth/auth.module'
import { EnvModule } from './env/env.module'
import { EventsModule } from './events/events.module'
import { HttpModule } from './http/http.module'
import { ErrorLoggingInterceptor } from './logging/interceptors/error-logging.interceptor'
import { LoggingInterceptor } from './logging/interceptors/logging.interceptor'
import { LoggingModule } from './logging/logging.module'
import { WorkersModule } from './workers/workers.module'

@Module({
  imports: [
    LoggingModule,
    AuthModule,
    HttpModule,
    EnvModule,
    EventsModule,
    WorkersModule,
  ],
  providers: [
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
