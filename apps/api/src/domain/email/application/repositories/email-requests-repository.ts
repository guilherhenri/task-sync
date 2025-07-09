import type { EmailTemplateType } from '@task-sync/api-types'

import type {
  EmailPriority,
  EmailRequest,
} from '../../enterprise/entities/email-request'
import type { EmailStatus } from '../../enterprise/entities/value-objects/email-status'

export interface EmailRequestsRepository {
  findById(id: string): Promise<EmailRequest<EmailTemplateType> | null>
  findPending(
    limit: number,
    offset?: number,
  ): Promise<Array<EmailRequest<EmailTemplateType>>>
  findByStatusAndPriority(
    status: EmailStatus,
    priority: EmailPriority,
    limit: number,
    offset?: number,
  ): Promise<Array<EmailRequest<EmailTemplateType>>>

  create(emailRequest: EmailRequest<EmailTemplateType>): Promise<void>
  save(emailRequest: EmailRequest<EmailTemplateType>): Promise<void>
}
