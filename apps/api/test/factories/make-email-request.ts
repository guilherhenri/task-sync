import { faker } from '@faker-js/faker'
import type {
  EmailTemplateDataMap,
  EmailTemplateType,
} from '@task-sync/api-types'

import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import {
  type EmailPriority,
  EmailRequest,
  type EmailRequestProps,
  type EventType,
} from '@/domain/email/enterprise/entities/email-request'

const priorities: Array<EmailPriority> = ['low', 'medium', 'high', 'urgent']
const events: Array<EventType> = [
  'email_update_verification',
  'email_verification',
  'password_recovery',
  'password_reset',
  'user_registered',
]

export function makeEmailRequest<T extends EmailTemplateType>(
  override: Partial<EmailRequestProps<T>> = {},
  id?: UniqueEntityID,
) {
  const { templateName, data } = emailTemplateFactory(
    override.templateName,
    override.data,
  )

  const emailRequest = EmailRequest.create(
    {
      eventType: faker.helpers.arrayElement(events),
      recipientId: new UniqueEntityID(),
      recipientEmail: faker.internet.email(),
      priority: faker.helpers.arrayElement(priorities),
      templateName,
      data,
      ...override,
    },
    id,
  )

  return emailRequest
}

const emailTemplateFactory = <T extends EmailTemplateType>(
  templateName?: EmailTemplateType,
  providedData?: EmailTemplateDataMap[T],
) => {
  const templateTypes: EmailTemplateType[] = [
    'email-verify',
    'password-recovery',
    'password-reset',
    'update-email-verify',
    'welcome',
  ]

  const inferTemplateNameFromData = (
    data: EmailTemplateDataMap[EmailTemplateType],
  ): EmailTemplateType => {
    if ('verificationLink' in data && 'name' in data) {
      return data.verificationLink.includes('verify')
        ? 'email-verify'
        : 'update-email-verify'
    }

    if ('resetLink' in data && 'name' in data) {
      return 'password-recovery'
    }

    if ('name' in data && Object.keys(data).length === 1) {
      return 'password-reset'
    }

    return faker.helpers.arrayElement(templateTypes)
  }

  const selectedType =
    templateName ??
    (providedData
      ? inferTemplateNameFromData(providedData)
      : faker.helpers.arrayElement(templateTypes))

  const generateData = (
    type: EmailTemplateType,
  ): EmailTemplateDataMap[EmailTemplateType] => {
    if (!providedData) {
      const name = faker.person.fullName()

      switch (type) {
        case 'email-verify':
          return {
            name,
            verificationLink: faker.internet.url(),
          }
        case 'password-recovery':
          return {
            name,
            resetLink: faker.internet.url(),
          }
        case 'password-reset':
          return {
            name,
          }
        case 'update-email-verify':
          return {
            name,
            verificationLink: faker.internet.url(),
          }
        case 'welcome':
          return {
            name,
          }
      }
    }

    return providedData
  }

  return {
    templateName: selectedType,
    data: generateData(selectedType),
  }
}
