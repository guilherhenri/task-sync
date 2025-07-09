import type {
  EmailTemplateDataMap,
  EmailTemplateType,
} from '@task-sync/api-types'

import { Entity } from '@/core/entities/entity'
import type { UniqueEntityID } from '@/core/entities/unique-entity-id'
import type { Optional } from '@/core/types/optional'

import { EmailStatus } from './value-objects/email-status'

export type EventType =
  | 'email_update_verification'
  | 'email_verification'
  | 'password_recovery'
  | 'password_reset'
  | 'user_registered'

export type EmailPriority = 'low' | 'medium' | 'high' | 'urgent'

const EmailSubjectMap: Record<EventType, string> = {
  email_update_verification: 'Verificar e-mail',
  email_verification: 'Verificar e-mail',
  password_recovery: 'Recuperar senha',
  password_reset: 'Senha alterada',
  user_registered: 'Bem-vindo(a)',
} as const

export type EmailSubject = typeof EmailSubjectMap

export interface EmailRequestProps<Template extends EmailTemplateType> {
  eventType: EventType
  recipientId: UniqueEntityID
  recipientEmail: string
  subject: EmailSubject[EventType] | string
  templateName: Template
  data: EmailTemplateDataMap[Template]
  status: EmailStatus
  priority: EmailPriority
  createdAt: Date
  updatedAt?: Date
}

export class EmailRequest<T extends EmailTemplateType> extends Entity<
  EmailRequestProps<T>
> {
  get eventType() {
    return this.props.eventType
  }

  get recipientId() {
    return this.props.recipientId
  }

  get recipientEmail() {
    return this.props.recipientEmail
  }

  get subject() {
    return this.props.subject
  }

  get templateName() {
    return this.props.templateName
  }

  get data() {
    return this.props.data
  }

  get status() {
    return this.props.status
  }

  get priority() {
    return this.props.priority
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  /**
   * Advances the email request status to the next logical state in the processing lifecycle.
   * Updates the `updatedAt` timestamp to reflect the change.
   */
  advanceStatus() {
    this.props.status = EmailStatus.getNextStatus(this.props.status.value)
    this.touch()
  }

  /**
   * Marks the email request as failed, setting its status to 'failed'.
   * Updates the `updatedAt` timestamp to reflect the change.
   */
  markAsFailed() {
    this.props.status = new EmailStatus('failed')
    this.touch()
  }

  protected touch() {
    this.props.updatedAt = new Date()
  }

  static create<T extends EmailTemplateType>(
    props: Optional<
      Omit<EmailRequestProps<T>, 'status'>,
      'subject' | 'priority' | 'createdAt'
    >,
    id?: UniqueEntityID,
  ) {
    const emailRequest = new EmailRequest(
      {
        ...props,
        subject: props.subject ?? EmailSubjectMap[props.eventType],
        status: new EmailStatus(),
        priority: props.priority ?? 'medium',
        createdAt: new Date(),
      },
      id,
    )

    return emailRequest
  }
}
