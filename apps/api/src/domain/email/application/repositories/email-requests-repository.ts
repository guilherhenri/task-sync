import type { EmailTemplateType } from '@task-sync/api-types'

import type {
  EmailPriority,
  EmailRequest,
} from '../../enterprise/entities/email-request'
import type { EmailStatus } from '../../enterprise/entities/value-objects/email-status'

export abstract class EmailRequestsRepository {
  abstract findById(id: string): Promise<EmailRequest<EmailTemplateType> | null>
  abstract findPending(
    limit: number,
    offset?: number,
  ): Promise<Array<EmailRequest<EmailTemplateType>>>

  abstract findByStatusAndPriority(
    status: EmailStatus,
    priority: EmailPriority,
    limit: number,
    offset?: number,
  ): Promise<Array<EmailRequest<EmailTemplateType>>>

  abstract create(emailRequest: EmailRequest<EmailTemplateType>): Promise<void>
  abstract save(emailRequest: EmailRequest<EmailTemplateType>): Promise<void>
}
