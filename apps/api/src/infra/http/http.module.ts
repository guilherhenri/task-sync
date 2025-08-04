import { Module } from '@nestjs/common'

import { EnrollIdentityUseCase } from '@/domain/auth/application/use-cases/enroll-identity'

import { CryptographyModule } from '../cryptography/cryptography.module'
import { DatabaseModule } from '../database/database.module'
import { KeyValueModule } from '../key-value/key-value.module'
import { RegisterController } from './controllers/register.controller'

@Module({
  imports: [DatabaseModule, KeyValueModule, CryptographyModule],
  controllers: [RegisterController],
  providers: [EnrollIdentityUseCase],
})
export class HttpModule {}
