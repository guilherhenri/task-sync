import { Test, type TestingModule } from '@nestjs/testing'
import type { Transporter } from 'nodemailer'

import { EnvModule } from '@/infra/env/env.module'
import { EnvService } from '@/infra/env/env.service'

import { EmailService } from '../contracts/email-service'
import { NodemailerEmailService } from './nodemailer-email.service'

describe('Nodemailer Email Service', () => {
  let module: TestingModule
  let envService: EnvService
  let emailService: EmailService
  let transporter: Transporter

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [EnvModule],
      providers: [{ provide: EmailService, useClass: NodemailerEmailService }],
    }).compile()

    envService = module.get(EnvService)
    emailService = module.get(EmailService)
    transporter = (emailService as any).transporter; // eslint-disable-line
  })

  it('should be able to send a email', async () => {
    const transporterSendEmailSpy = jest.spyOn(transporter, 'sendMail')

    await emailService.sendEmail({
      to: 'example@gmail.com',
      subject: 'Email teste',
      html: '<h1>Hello World</h1>',
    })

    expect(transporterSendEmailSpy).toHaveBeenCalled()
    expect(transporterSendEmailSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        from: envService.get('EMAIL_DEFAULT_SENDER'),
        to: 'example@gmail.com',
        subject: 'Email teste',
        html: '<h1>Hello World</h1>',
      }),
    )
  })
})
