import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import type { EmailTemplateType } from '@task-sync/api-types'
import { Document } from 'mongoose'

import type {
  EmailPriority,
  EventType,
} from '@/domain/email/enterprise/entities/email-request'
import type { Status } from '@/domain/email/enterprise/entities/value-objects/email-status'

const events: Array<EventType> = [
  'email_update_verification',
  'email_verification',
  'password_recovery',
  'password_reset',
  'user_registered',
] as const
const templates: Array<EmailTemplateType> = [
  'email-verify',
  'password-recovery',
  'password-reset',
  'update-email-verify',
  'welcome',
] as const
const status: Array<Status> = [
  'pending',
  'processing',
  'sent',
  'failed',
] as const
const priority: Array<EmailPriority> = [
  'low',
  'medium',
  'high',
  'urgent',
] as const

@Schema({ collection: 'email_requests', timestamps: true, _id: true })
export class EmailRequest extends Document {
  @Prop({ type: String, required: true })
  declare _id: string

  @Prop({ name: 'event_type', required: true, type: String, enum: events })
  eventType: EventType

  @Prop({ name: 'recipient_id', required: true })
  recipientId: string

  @Prop({ name: 'recipient_email', required: true })
  recipientEmail: string

  @Prop({ required: true })
  subject: string

  @Prop({ required: true, type: String, enum: templates })
  template: EmailTemplateType

  @Prop({ required: true, type: Map, of: String })
  data: Record<string, string>

  @Prop({ required: true, type: String, enum: status, default: 'pending' })
  status: Status

  @Prop({ required: true, type: String, enum: priority, default: 'medium' })
  priority: EmailPriority

  @Prop({ name: 'created_at', type: Date })
  createdAt?: Date

  @Prop({ name: 'updated_at', type: Date })
  updatedAt?: Date
}

export const EmailRequestSchema = SchemaFactory.createForClass(EmailRequest)
