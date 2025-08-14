import { Injectable } from '@nestjs/common'
import type {
  EmailTemplateDataMap,
  EmailTemplateType,
} from '@task-sync/api-types'

import { type Either, right } from '@/core/either'
import type { UniqueEntityID } from '@/core/entities/unique-entity-id'

import {
  type EmailPriority,
  EmailRequest,
  type EventType,
} from '../../enterprise/entities/email-request'
import { EmailRequestsRepository } from '../repositories/email-requests-repository'
import { EmailQueueService } from '../services/email-queue-service'

export interface CreateEmailRequestUseCaseRequest<T extends EmailTemplateType> {
  eventType: EventType
  recipientId: UniqueEntityID
  recipientEmail: string
  subject?: string
  templateName: T
  data: EmailTemplateDataMap[T]
  priority?: EmailPriority
}

export type CreateEmailRequestUseCaseResponse = Either<unknown, unknown>

@Injectable()
export class CreateEmailRequestUseCase {
  constructor(
    private emailRequestsRepository: EmailRequestsRepository,
    private emailQueueService: EmailQueueService,
  ) {}

  async execute<T extends EmailTemplateType>({
    eventType,
    recipientId,
    recipientEmail,
    subject,
    templateName,
    data,
    priority,
  }: CreateEmailRequestUseCaseRequest<T>): Promise<CreateEmailRequestUseCaseResponse> {
    const emailRequest = EmailRequest.create({
      eventType,
      recipientId,
      recipientEmail,
      subject,
      templateName,
      data,
      priority,
    })

    await this.emailRequestsRepository.create(emailRequest)

    await this.emailQueueService.enqueueEmailRequest(
      emailRequest.id,
      emailRequest.priority,
    )

    return right({})
  }
}
