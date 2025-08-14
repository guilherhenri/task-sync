import { Module } from '@nestjs/common'

import { EnvModule } from '../env/env.module'
import { EmailService } from './contracts/email-service'
import { NodemailerEmailService } from './nodemailer/nodemailer-email.service'

@Module({
  imports: [EnvModule],
  providers: [{ provide: EmailService, useClass: NodemailerEmailService }],
  exports: [EmailService],
})
export class EmailModule {}
