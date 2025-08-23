import { Module } from '@nestjs/common'

import { AuthModule } from '@/infra/auth/auth.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { EnvModule } from '@/infra/env/env.module'

import { TestAppModule } from './test-app.module'

@Module({
  imports: [TestAppModule, DatabaseModule, AuthModule, EnvModule],
  exports: [TestAppModule, DatabaseModule, AuthModule, EnvModule],
})
export class AuthTestModule {}
