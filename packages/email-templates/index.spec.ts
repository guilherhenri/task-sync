import { faker } from '@faker-js/faker'
import * as ReactEmailComponents from '@react-email/components'
import React from 'react'

import type { Template } from '.'
import { render } from '.'
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

jest.mock('@react-email/components', () => ({
  render: jest.fn(),
}))

jest.mock('@task-sync/env', () => ({
  APP_URL: 'http://localhost:3000',
  LOGO_CDN_URL: faker.image.url(),
}))

describe('Render Function', () => {
  const mockRender = ReactEmailComponents.render as jest.Mock

  beforeEach(() => {
    mockRender.mockClear()
  })

  it('should render EmailVerificationEmail with correct props', async () => {
    const template: Template = 'email-verify'
    const data: EmailVerificationEmailProps = {
      name: 'John Doe',
      verificationLink: 'https://example.com/verify',
    }

    mockRender.mockResolvedValue('<html>Email Verification Content</html>')

    const result = await render(template, data)

    expect(mockRender).toHaveBeenCalledWith(
      React.createElement(EmailVerificationEmail, data),
    )
    expect(result).toBe('<html>Email Verification Content</html>')
  })

  it('should render PasswordRecoveryEmail with correct props', async () => {
    const template: Template = 'password-recovery'
    const data: PasswordRecoveryEmailProps = {
      name: 'Jane Doe',
      resetLink: 'https://example.com/reset',
    }

    mockRender.mockResolvedValue('<html>Password Recovery Content</html>')

    const result = await render(template, data)

    expect(mockRender).toHaveBeenCalledWith(
      React.createElement(PasswordRecoveryEmail, data),
    )
    expect(result).toBe('<html>Password Recovery Content</html>')
  })

  it('should render PasswordResetConfirmationEmail with correct props', async () => {
    const template: Template = 'password-reset'
    const data: PasswordResetConfirmationEmailProps = {
      name: 'John Smith',
    }

    mockRender.mockResolvedValue(
      '<html>Password Reset Confirmation Content</html>',
    )

    const result = await render(template, data)

    expect(mockRender).toHaveBeenCalledWith(
      React.createElement(PasswordResetConfirmationEmail, data),
    )
    expect(result).toBe('<html>Password Reset Confirmation Content</html>')
  })

  it('should render UpdateEmailVerificationEmail with correct props', async () => {
    const template: Template = 'update-email-verify'
    const data: UpdateEmailVerificationEmailProps = {
      name: 'Alice Johnson',
      verificationLink: 'https://example.com/update-verify',
    }

    mockRender.mockResolvedValue(
      '<html>Update Email Verification Content</html>',
    )

    const result = await render(template, data)

    expect(mockRender).toHaveBeenCalledWith(
      React.createElement(UpdateEmailVerificationEmail, data),
    )
    expect(result).toBe('<html>Update Email Verification Content</html>')
  })

  it('should render WelcomeEmail with correct props', async () => {
    const template: Template = 'welcome'
    const data: WelcomeEmailProps = {
      name: 'Bob Wilson',
    }

    mockRender.mockResolvedValue('<html>Welcome Email Content</html>')

    const result = await render(template, data)

    expect(mockRender).toHaveBeenCalledWith(
      React.createElement(WelcomeEmail, data),
    )
    expect(result).toBe('<html>Welcome Email Content</html>')
  })
})
