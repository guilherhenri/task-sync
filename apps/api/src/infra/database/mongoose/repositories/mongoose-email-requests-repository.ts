import { Injectable } from '@nestjs/common'
import type { EmailTemplateType } from '@task-sync/api-types'
import type { Model } from 'mongoose'

import { EmailRequestsRepository } from '@/domain/email/application/repositories/email-requests-repository'
import type {
  EmailPriority,
  EmailRequest,
} from '@/domain/email/enterprise/entities/email-request'
import type { EmailStatus } from '@/domain/email/enterprise/entities/value-objects/email-status'

import { MongooseEmailRequestMapper } from '../mappers/mongoose-email-request-mapper'
import { MongooseService } from '../mongoose.service'
import {
  type EmailRequest as MongooseEmailRequest,
  EmailRequestSchema,
} from '../schemas/email-request.schema'

@Injectable()
export class MongooseEmailRequestsRepository
  implements EmailRequestsRepository
{
  private emailRequestModel: Model<MongooseEmailRequest>

  constructor(private readonly mongoose: MongooseService) {
    this.emailRequestModel =
      this.mongoose.connection.model<MongooseEmailRequest>(
        'EmailRequest',
        EmailRequestSchema,
      )
  }

  async findById(id: string): Promise<EmailRequest<EmailTemplateType> | null> {
    const emailRequest = await this.emailRequestModel.findById(id).lean().exec()

    if (!emailRequest) return null

    return MongooseEmailRequestMapper.toDomain(emailRequest)
  }

  async findPending(
    limit: number,
    offset: number = 0,
  ): Promise<Array<EmailRequest<EmailTemplateType>>> {
    const emailRequests = await this.emailRequestModel
      .find({ status: 'pending' as MongooseEmailRequest['status'] })
      .limit(limit)
      .skip(offset)
      .lean()
      .exec()

    return emailRequests.map(MongooseEmailRequestMapper.toDomain)
  }

  async findByStatusAndPriority(
    status: EmailStatus,
    priority: EmailPriority,
    limit: number,
    offset: number = 0,
  ): Promise<Array<EmailRequest<EmailTemplateType>>> {
    const emailRequests = await this.emailRequestModel
      .find({ status, priority })
      .limit(limit)
      .skip(offset)
      .lean()
      .exec()

    return emailRequests.map(MongooseEmailRequestMapper.toDomain)
  }

  async create(emailRequest: EmailRequest<EmailTemplateType>): Promise<void> {
    const mongooseEmailRequest =
      MongooseEmailRequestMapper.toMongoose(emailRequest)

    await this.emailRequestModel.create(mongooseEmailRequest)
  }

  async save(emailRequest: EmailRequest<EmailTemplateType>): Promise<void> {
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
  }
}
