import { Injectable } from '@nestjs/common'
import type { EmailTemplateType } from '@task-sync/api-types'
import type { Model } from 'mongoose'

import { EmailRequestsRepository } from '@/domain/email/application/repositories/email-requests-repository'
import type {
  EmailPriority,
  EmailRequest,
} from '@/domain/email/enterprise/entities/email-request'
import type { EmailStatus } from '@/domain/email/enterprise/entities/value-objects/email-status'
import { ObservableRepository } from '@/infra/observability/observable-repository'

import { MongooseEmailRequestMapper } from '../mappers/mongoose-email-request-mapper'
import { MongooseService } from '../mongoose.service'
import {
  type EmailRequest as MongooseEmailRequest,
  EmailRequestSchema,
} from '../schemas/email-request.schema'

@Injectable()
export class MongooseEmailRequestsRepository
  extends ObservableRepository
  implements EmailRequestsRepository
{
  private emailRequestModel: Model<MongooseEmailRequest>

  constructor(private readonly mongoose: MongooseService) {
    super()
    this.emailRequestModel =
      this.mongoose.connection.model<MongooseEmailRequest>(
        'EmailRequest',
        EmailRequestSchema,
      )
  }

  async findById(id: string): Promise<EmailRequest<EmailTemplateType> | null> {
    return this.trackOperation(
      async () => {
        const emailRequest = await this.emailRequestModel
          .findById(id)
          .lean()
          .exec()

        if (!emailRequest) return null

        return MongooseEmailRequestMapper.toDomain(emailRequest)
      },
      {
        query: 'SELECT email request by id',
        operation: 'SELECT',
        table: 'email_requests',
      },
    )
  }

  async findPending(
    limit: number,
    offset: number = 0,
  ): Promise<Array<EmailRequest<EmailTemplateType>>> {
    return this.trackOperation(
      async () => {
        const emailRequests = await this.emailRequestModel
          .find({ status: 'pending' as MongooseEmailRequest['status'] })
          .limit(limit)
          .skip(offset)
          .lean()
          .exec()

        return emailRequests.map(MongooseEmailRequestMapper.toDomain)
      },
      {
        query: 'SELECT pending email requests',

        operation: 'SELECT',
        table: 'email_requests',
      },
    )
  }

  async findByStatusAndPriority(
    status: EmailStatus,
    priority: EmailPriority,
    limit: number,
    offset: number = 0,
  ): Promise<Array<EmailRequest<EmailTemplateType>>> {
    return this.trackOperation(
      async () => {
        const emailRequests = await this.emailRequestModel
          .find({ status, priority })
          .limit(limit)
          .skip(offset)
          .lean()
          .exec()

        return emailRequests.map(MongooseEmailRequestMapper.toDomain)
      },
      {
        query: 'SELECT email requests by status and priority',
        operation: 'SELECT',
        table: 'email_requests',
      },
    )
  }

  async create(emailRequest: EmailRequest<EmailTemplateType>): Promise<void> {
    await this.trackOperation(
      async () => {
        const mongooseEmailRequest =
          MongooseEmailRequestMapper.toMongoose(emailRequest)

        await this.emailRequestModel.create(mongooseEmailRequest)
      },
      {
        query: 'INSERT email request',
        operation: 'INSERT',
        table: 'email_requests',
      },
    )
  }

  async save(emailRequest: EmailRequest<EmailTemplateType>): Promise<void> {
    await this.trackOperation(
      async () => {
        const mongooseEmailRequest =
          MongooseEmailRequestMapper.toMongoose(emailRequest)

        await this.emailRequestModel
          .updateOne(
            {
              _id: emailRequest.id.toString(),
            },
            { $set: mongooseEmailRequest },
            { upsert: true },
          )
          .exec()
      },
      {
        query: 'UPDATE email request',
        operation: 'UPDATE',
        table: 'email_requests',
      },
    )
  }
}
