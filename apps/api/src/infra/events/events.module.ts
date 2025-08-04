import { Module } from '@nestjs/common'

import { OnEmailVerificationRequested } from '@/domain/email/application/subscribers/on-email-verification-requested'
import { OnUserRegistered } from '@/domain/email/application/subscribers/on-user-registered'
import { CreateEmailRequestUseCase } from '@/domain/email/application/use-cases/create-email-request'

import { DatabaseModule } from '../database/database.module'
import { ServicesModule } from '../services/services.module'

@Module({
  imports: [DatabaseModule, ServicesModule],
  providers: [
    OnUserRegistered,
    OnEmailVerificationRequested,
    CreateEmailRequestUseCase,
  ],
})
export class EventsModule {}
