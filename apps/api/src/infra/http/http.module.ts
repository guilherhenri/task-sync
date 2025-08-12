import { Module } from '@nestjs/common'

import { AuthenticateSessionUseCase } from '@/domain/auth/application/use-cases/authenticate-session'
import { ConfirmEmailUseCase } from '@/domain/auth/application/use-cases/confirm-email'
import { EnrollIdentityUseCase } from '@/domain/auth/application/use-cases/enroll-identity'
import { InitiatePasswordRecoveryUseCase } from '@/domain/auth/application/use-cases/initiate-password-recovery'
import { RenewTokenUseCase } from '@/domain/auth/application/use-cases/renew-token'
import { ResetPasswordUseCase } from '@/domain/auth/application/use-cases/reset-password'
import { TerminateSessionUseCase } from '@/domain/auth/application/use-cases/terminate-session'

import { CryptographyModule } from '../cryptography/cryptography.module'
import { DatabaseModule } from '../database/database.module'
import { EnvModule } from '../env/env.module'
import { KeyValueModule } from '../key-value/key-value.module'
import { AuthenticateController } from './controllers/authenticate.controller'
import { ConfirmEmailController } from './controllers/confirm-email.controller'
import { ForgotPasswordController } from './controllers/forgot-password.controller'
import { LogoutController } from './controllers/logout.controller'
import { RefreshTokenController } from './controllers/refresh-token.controller'
import { RegisterController } from './controllers/register.controller'
import { ResetPasswordController } from './controllers/reset-password.controller'

@Module({
  imports: [DatabaseModule, KeyValueModule, CryptographyModule, EnvModule],
  controllers: [
    RegisterController,
    ConfirmEmailController,
    AuthenticateController,
    RefreshTokenController,
    LogoutController,
    ForgotPasswordController,
    ResetPasswordController,
  ],
  providers: [
    EnrollIdentityUseCase,
    ConfirmEmailUseCase,
    AuthenticateSessionUseCase,
    RenewTokenUseCase,
    TerminateSessionUseCase,
    InitiatePasswordRecoveryUseCase,
    ResetPasswordUseCase,
  ],
})
export class HttpModule {}
