export interface SendEmailParams {
  recipientEmail: string
  subject: string
  html: string
}

export interface EmailSenderService {
  sendEmail(params: SendEmailParams): Promise<void>
}
