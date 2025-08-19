import type { EmailTemplateType } from '@task-sync/api-types'

import type { EmailRequestsRepository } from '@/domain/email/application/repositories/email-requests-repository'
import type {
  EmailPriority,
  EmailRequest,
} from '@/domain/email/enterprise/entities/email-request'
import type { EmailStatus } from '@/domain/email/enterprise/entities/value-objects/email-status'

export class InMemoryEmailRequestsRepository
  implements EmailRequestsRepository
{
  public items: Array<EmailRequest<EmailTemplateType>> = []

  async findById(id: string): Promise<EmailRequest<EmailTemplateType> | null> {
    return this.items.find((item) => item.id.toString() === id) ?? null
  }

  async findPending(
    limit: number,
    offset: number = 0,
  ): Promise<EmailRequest<EmailTemplateType>[]> {
    return this.items
      .filter((item) => item.status.value === 'pending')
      .slice(offset, offset + limit)
  }

  async findByStatusAndPriority(
    status: EmailStatus,
    priority: EmailPriority,
    limit: number,
    offset: number = 0,
  ): Promise<EmailRequest<EmailTemplateType>[]> {
    return this.items
      .filter((item) => item.status === status && item.priority === priority)
      .slice(offset, offset + limit)
  }

  async create(emailRequest: EmailRequest<EmailTemplateType>): Promise<void> {
    this.items.push(emailRequest)
  }

  async save(emailRequest: EmailRequest<EmailTemplateType>): Promise<void> {
    const index = this.items.findIndex((item) =>
      item.id.equals(emailRequest.id),
    )

    this.items[index] = emailRequest
  }
}
