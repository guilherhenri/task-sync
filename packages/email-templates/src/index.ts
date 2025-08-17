import { render as reactEmailRender } from '@react-email/components'
import type {
  EmailTemplateDataMap,
  EmailTemplateType,
} from '@task-sync/api-types'
import { createElement, type FC } from 'react'

import { EmailVerificationEmail } from './emails/email-verification'
import { PasswordRecoveryEmail } from './emails/password-recovery'
import { PasswordResetConfirmationEmail } from './emails/password-reset-confirmation'
import { UpdateEmailVerificationEmail } from './emails/update-email-verification'
import { WelcomeEmail } from './emails/welcome'

type TemplateComponents = {
  'email-verify': React.FC<EmailTemplateDataMap['email-verify']>
  'password-recovery': React.FC<EmailTemplateDataMap['password-recovery']>
  'password-reset': React.FC<EmailTemplateDataMap['password-reset']>
  'update-email-verify': React.FC<EmailTemplateDataMap['update-email-verify']>
  welcome: React.FC<EmailTemplateDataMap['welcome']>
}

const templateComponents: TemplateComponents = {
  'email-verify': EmailVerificationEmail,
  'password-recovery': PasswordRecoveryEmail,
  'password-reset': PasswordResetConfirmationEmail,
  'update-email-verify': UpdateEmailVerificationEmail,
  welcome: WelcomeEmail,
} as const

const render = async <T extends EmailTemplateType>(
  template: T,
  data: EmailTemplateDataMap[T],
): Promise<string> => {
  const Component = templateComponents[template] as FC<EmailTemplateDataMap[T]>

  return reactEmailRender(createElement(Component, data))
}

export { render }
