import * as ReactEmailComponents from '@react-email/components'
import type {
  EmailTemplateDataMap,
  EmailTemplateType,
} from '@task-sync/api-types'
import React from 'react'

import { render } from '.'
import { EmailVerificationEmail } from './emails/email-verification'
import { PasswordRecoveryEmail } from './emails/password-recovery'
import { PasswordResetConfirmationEmail } from './emails/password-reset-confirmation'
import { UpdateEmailVerificationEmail } from './emails/update-email-verification'
import { WelcomeEmail } from './emails/welcome'

jest.mock('@react-email/components', () => ({
  render: jest.fn(),
}))

jest.mock('@task-sync/env', () => ({
  env: {
    APP_URL: 'http://localhost:3000',
  },
}))

describe('Render Function', () => {
  const mockRender = ReactEmailComponents.render as jest.Mock

  beforeEach(() => {
    mockRender.mockClear()
  })

  it('should render EmailVerificationEmail with correct props', async () => {
    const template: EmailTemplateType = 'email-verify'
    const data: EmailTemplateDataMap['email-verify'] = {
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
    const template: EmailTemplateType = 'password-recovery'
    const data: EmailTemplateDataMap['password-recovery'] = {
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
    const template: EmailTemplateType = 'password-reset'
    const data: EmailTemplateDataMap['password-reset'] = {
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
    const template: EmailTemplateType = 'update-email-verify'
    const data: EmailTemplateDataMap['update-email-verify'] = {
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
    const template: EmailTemplateType = 'welcome'
    const data: EmailTemplateDataMap['welcome'] = {
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
