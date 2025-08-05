import { Module } from '@nestjs/common'

import { ConfirmEmailUseCase } from '@/domain/auth/application/use-cases/confirm-email'
import { EnrollIdentityUseCase } from '@/domain/auth/application/use-cases/enroll-identity'

import { CryptographyModule } from '../cryptography/cryptography.module'
import { DatabaseModule } from '../database/database.module'
import { KeyValueModule } from '../key-value/key-value.module'
import { ConfirmEmailController } from './controllers/confirm-email.controller'
import { RegisterController } from './controllers/register.controller'

@Module({
  imports: [DatabaseModule, KeyValueModule, CryptographyModule],
  controllers: [RegisterController, ConfirmEmailController],
  providers: [EnrollIdentityUseCase, ConfirmEmailUseCase],
})
export class HttpModule {}
