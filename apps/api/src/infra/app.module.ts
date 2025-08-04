import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { EnvModule } from './env/env.module'
import { EventsModule } from './events/events.module'
import { HttpModule } from './http/http.module'
import { WorkersModule } from './workers/workers.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HttpModule,
    EnvModule,
    EventsModule,
    WorkersModule,
  ],
})
export class AppModule {}
