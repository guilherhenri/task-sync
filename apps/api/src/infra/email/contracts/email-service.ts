export interface SendEmailParams {
  to: string
  subject: string
  html: string
}

export abstract class EmailService {
  abstract sendEmail(params: SendEmailParams): Promise<void>
}
