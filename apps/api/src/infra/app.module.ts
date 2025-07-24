import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { EnvModule } from './env/env.module'
import { HttpModule } from './http/http.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HttpModule,
    EnvModule,
  ],
})
export class AppModule {}
