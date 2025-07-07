import { render as reactEmailRender } from '@react-email/components'
import React from 'react'

import {
  EmailVerificationEmail,
  type EmailVerificationEmailProps,
} from './emails/email-verification'
import {
  PasswordRecoveryEmail,
  type PasswordRecoveryEmailProps,
} from './emails/password-recovery'
import {
  PasswordResetConfirmationEmail,
  type PasswordResetConfirmationEmailProps,
} from './emails/password-reset-confirmation'
import {
  UpdateEmailVerificationEmail,
  type UpdateEmailVerificationEmailProps,
} from './emails/update-email-verification'
import { WelcomeEmail, type WelcomeEmailProps } from './emails/welcome'

const templateComponents = {
  'email-verify': EmailVerificationEmail,
  'password-recovery': PasswordRecoveryEmail,
  'password-reset': PasswordResetConfirmationEmail,
  'update-email-verify': UpdateEmailVerificationEmail,
  welcome: WelcomeEmail,
} as const

export type Template = keyof typeof templateComponents

interface TemplateDataMap {
  'email-verify': EmailVerificationEmailProps
  'password-recovery': PasswordRecoveryEmailProps
  'password-reset': PasswordResetConfirmationEmailProps
  'update-email-verify': UpdateEmailVerificationEmailProps
  welcome: WelcomeEmailProps
}

const render = async <T extends Template>(
  template: T,
  data: TemplateDataMap[T],
): Promise<string> => {
  const Component = templateComponents[template] as React.FC<TemplateDataMap[T]>

  return reactEmailRender(React.createElement(Component, data))
}

export { render }
