import type {
  EmailTemplateDataMap,
  EmailTemplateType,
} from '@task-sync/api-types'

import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { EmailRequest } from '@/domain/email/enterprise/entities/email-request'
import { EmailStatus } from '@/domain/email/enterprise/entities/value-objects/email-status'

import type { EmailRequest as MongooseEmailRequest } from '../schemas/email-request.schema'

export class MongooseEmailRequestMapper {
  static toDomain(
    raw: MongooseEmailRequest,
  ): EmailRequest<typeof raw.template> {
    return EmailRequest.create(
      {
        eventType: raw.eventType,
        recipientId: new UniqueEntityID(raw.recipientId),
        recipientEmail: raw.recipientEmail,
        subject: raw.subject,
        templateName: raw.template,
        data: raw.data as EmailTemplateDataMap[typeof raw.template],
        status: new EmailStatus(raw.status),
        priority: raw.priority,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      new UniqueEntityID(raw._id),
    )
  }

  static toMongoose<T extends EmailTemplateType>(
    raw: EmailRequest<T>,
  ): Partial<MongooseEmailRequest> {
    return {
      _id: raw.id.toString(),
      eventType: raw.eventType,
      recipientId: raw.recipientId.toString(),
      recipientEmail: raw.recipientEmail,
      subject: raw.subject,
      template: raw.templateName,
      data: raw.data,
      status: raw.status.value,
      priority: raw.priority,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    }
  }
}
