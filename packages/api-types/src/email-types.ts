export type EmailTemplateType =
  | 'email-verify'
  | 'password-recovery'
  | 'password-reset'
  | 'update-email-verify'
  | 'welcome'

export interface EmailTemplateDataMap {
  'email-verify': { name: string; verificationLink: string }
  'password-recovery': { name: string; resetLink: string }
  'password-reset': { name: string }
  'update-email-verify': { name: string; verificationLink: string }
  welcome: { name: string }
}
