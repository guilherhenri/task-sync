import { faker } from '@faker-js/faker'
import type { EmailTemplateType } from '@task-sync/api-types'

import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { EmailRequestProps } from '@/domain/email/enterprise/entities/email-request'

import { makeEmailRequest } from './make-email-request'

describe('makeEmailRequest', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest
      .spyOn(faker.helpers, 'arrayElement')
      .mockReturnValue(
        faker.helpers.arrayElement([
          'email-verify',
          'password-recovery',
          'password-reset',
          'update-email-verify',
          'welcome',
        ]),
      )
    jest.spyOn(faker.internet, 'email').mockReturnValue('test@example.com')
    jest.spyOn(faker.internet, 'url').mockReturnValue('https://example.com')
    jest.spyOn(faker.person, 'fullName').mockReturnValue('John Doe')
  })

  it('should create an EmailRequest with overridden properties when provided', () => {
    const override: Partial<EmailRequestProps<EmailTemplateType>> = {
      eventType: 'password_recovery',
      recipientEmail: 'custom@example.com',
      priority: 'high',
      templateName: 'password-recovery',
      data: { name: 'Jane Doe', resetLink: 'https://custom.com/reset' },
    }

    const emailRequest = makeEmailRequest(override)

    expect(emailRequest.eventType).toBe('password_recovery')
    expect(emailRequest.recipientEmail).toBe('custom@example.com')
    expect(emailRequest.priority).toBe('high')
    expect(emailRequest.templateName).toBe('password-recovery')
    expect(emailRequest.data).toEqual({
      name: 'Jane Doe',
      resetLink: 'https://custom.com/reset',
    })
  })

  it('should use provided id when creating EmailRequest', () => {
    const customId = new UniqueEntityID('custom-id')
    const emailRequest = makeEmailRequest({}, customId)

    expect(emailRequest.id).toEqual(customId)
  })

  it('should generate correct data for email-verify template', () => {
    jest.spyOn(faker.helpers, 'arrayElement').mockReturnValue('email-verify')
    const emailRequest = makeEmailRequest()

    expect(emailRequest.templateName).toBe('email-verify')
    expect(emailRequest.data).toEqual({
      name: 'John Doe',
      verificationLink: 'https://example.com',
    })
  })

  it('should generate correct data for password-recovery template', () => {
    jest
      .spyOn(faker.helpers, 'arrayElement')
      .mockReturnValue('password-recovery')
    const emailRequest = makeEmailRequest()

    expect(emailRequest.templateName).toBe('password-recovery')
    expect(emailRequest.data).toEqual({
      name: 'John Doe',
      resetLink: 'https://example.com',
    })
  })

  it('should generate correct data for password-reset template', () => {
    jest.spyOn(faker.helpers, 'arrayElement').mockReturnValue('password-reset')
    const emailRequest = makeEmailRequest()

    expect(emailRequest.templateName).toBe('password-reset')
    expect(emailRequest.data).toEqual({
      name: 'John Doe',
    })
  })

  it('should generate correct data for update-email-verify template', () => {
    jest
      .spyOn(faker.helpers, 'arrayElement')
      .mockReturnValue('update-email-verify')
    const emailRequest = makeEmailRequest()

    expect(emailRequest.templateName).toBe('update-email-verify')
    expect(emailRequest.data).toEqual({
      name: 'John Doe',
      verificationLink: 'https://example.com',
    })
  })

  it('should generate correct data for welcome template', () => {
    jest.spyOn(faker.helpers, 'arrayElement').mockReturnValue('welcome')
    const emailRequest = makeEmailRequest()

    expect(emailRequest.templateName).toBe('welcome')
    expect(emailRequest.data).toEqual({
      name: 'John Doe',
    })
  })

  describe('when using provided templateName', () => {
    it('should generate correct data for email-verify template', () => {
      const override: Partial<EmailRequestProps<EmailTemplateType>> = {
        templateName: 'email-verify',
      }

      const emailRequest = makeEmailRequest(override)

      expect(emailRequest.templateName).toBe('email-verify')
      expect(emailRequest.data).toEqual({
        name: expect.any(String),
        verificationLink: expect.any(String),
      })
    })

    it('should generate correct data for password-recovery template', () => {
      const override: Partial<EmailRequestProps<EmailTemplateType>> = {
        templateName: 'password-recovery',
      }

      const emailRequest = makeEmailRequest(override)

      expect(emailRequest.templateName).toBe('password-recovery')
      expect(emailRequest.data).toEqual({
        name: expect.any(String),
        resetLink: expect.any(String),
      })
    })

    it('should generate correct data for update-email-verify template', () => {
      const override: Partial<EmailRequestProps<EmailTemplateType>> = {
        templateName: 'update-email-verify',
      }

      const emailRequest = makeEmailRequest(override)

      expect(emailRequest.templateName).toBe('update-email-verify')
      expect(emailRequest.data).toEqual({
        name: expect.any(String),
        verificationLink: expect.any(String),
      })
    })
  })

  describe('when inferring templateName from data', () => {
    it('should infer password-recovery from resetLink data', () => {
      const override: Partial<EmailRequestProps<EmailTemplateType>> = {
        data: { name: 'John Doe', resetLink: 'https://example.com/reset' },
      }

      const emailRequest = makeEmailRequest(override)

      expect(emailRequest.templateName).toBe('password-recovery')
      expect(emailRequest.data).toEqual({
        name: 'John Doe',
        resetLink: 'https://example.com/reset',
      })
    })

    it('should infer email-verify from verificationLink data', () => {
      const override: Partial<EmailRequestProps<EmailTemplateType>> = {
        data: {
          name: 'John Doe',
          verificationLink: 'https://example.com/verify',
        },
      }

      const emailRequest = makeEmailRequest(override)

      expect(emailRequest.templateName).toBe('email-verify')
      expect(emailRequest.data).toEqual({
        name: 'John Doe',
        verificationLink: 'https://example.com/verify',
      })
    })

    it('should infer update-email-verify from specific verificationLink pattern', () => {
      const override: Partial<EmailRequestProps<EmailTemplateType>> = {
        data: {
          name: 'John Doe',
          verificationLink: 'https://example.com/update',
        },
      }

      const emailRequest = makeEmailRequest(override)

      expect(emailRequest.templateName).toBe('update-email-verify')
      expect(emailRequest.data).toEqual({
        name: 'John Doe',
        verificationLink: 'https://example.com/update',
      })
    })

    it('should default to password-reset when only name is provided', () => {
      const override: Partial<EmailRequestProps<EmailTemplateType>> = {
        data: {
          name: 'John Doe',
        },
      }

      const emailRequest = makeEmailRequest(override)

      expect(emailRequest.templateName).toBe('password-reset')
      expect(emailRequest.data).toEqual({
        name: 'John Doe',
      })
    })

    it('should handle invalid data gracefully', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const override = { data: { invalid: 'invalid' } } as any

      const emailRequest = makeEmailRequest(override)

      expect(emailRequest).toEqual(expect.any(Object))
    })
  })
})
