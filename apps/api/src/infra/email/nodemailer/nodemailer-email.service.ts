import { Injectable } from '@nestjs/common'
import { createTransport, type Transporter } from 'nodemailer'

import { EnvService } from '@/infra/env/env.service'
import { ObservableService } from '@/infra/observability/observable-service'

import { EmailService, type SendEmailParams } from '../contracts/email-service'

@Injectable()
export class NodemailerEmailService
  extends ObservableService
  implements EmailService
{
  private readonly transporter: Transporter

  constructor(private readonly config: EnvService) {
    super()
    this.transporter = createTransport({
      host: config.get('SMTP_HOST'),
      port: config.get('SMTP_PORT'),
      secure: false,
      auth: { user: config.get('SMTP_USER'), pass: config.get('SMTP_PASS') },
    })
  }

  async sendEmail({ to, subject, html }: SendEmailParams): Promise<void> {
    await this.trackOperation(
      async () => {
        await this.transporter.sendMail({
          from: this.config.get('EMAIL_DEFAULT_SENDER'),
          to,
          subject,
          html,
        })
      },
      { service: 'nodemailer', endpoint: 'smtp', method: 'POST' },
    )
  }
}
