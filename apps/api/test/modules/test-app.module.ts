import {
  type MiddlewareConsumer,
  Module,
  type NestModule,
} from '@nestjs/common'
import cookieParser from 'cookie-parser'

import { AppModule } from '@/infra/app.module'
import { EnvModule } from '@/infra/env/env.module'
import { EnvService } from '@/infra/env/env.service'

@Module({
  imports: [AppModule, EnvModule],
})
export class TestAppModule implements NestModule {
  constructor(private readonly config: EnvService) {}

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(cookieParser(this.config.get('COOKIE_SECRET')))
      .forRoutes('*')
  }
}
