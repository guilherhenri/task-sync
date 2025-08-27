import { Injectable } from '@nestjs/common'
import type { EmailTemplateType } from '@task-sync/api-types'
import type { Model } from 'mongoose'

import { EmailRequestsRepository } from '@/domain/email/application/repositories/email-requests-repository'
import type {
  EmailPriority,
  EmailRequest,
} from '@/domain/email/enterprise/entities/email-request'
import type { EmailStatus } from '@/domain/email/enterprise/entities/value-objects/email-status'
import { WinstonService } from '@/infra/logging/winston.service'
import { MetricsService } from '@/infra/metrics/metrics.service'

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

  constructor(
    private readonly mongoose: MongooseService,
    private readonly winston: WinstonService,
    private readonly metrics: MetricsService,
  ) {
    this.emailRequestModel =
      this.mongoose.connection.model<MongooseEmailRequest>(
        'EmailRequest',
        EmailRequestSchema,
      )
  }

  async findById(id: string): Promise<EmailRequest<EmailTemplateType> | null> {
    const startTime = Date.now()

    try {
      const emailRequest = await this.emailRequestModel
        .findById(id)
        .lean()
        .exec()

      this.winston.logDatabaseQuery({
        query: 'SELECT email request by id',
        duration: Date.now() - startTime,
        success: true,
        table: 'email_requests',
        operation: 'SELECT',
      })
      this.metrics.recordDbMetrics(
        'SELECT',
        'email_requests',
        Date.now() - startTime,
        true,
      )

      if (!emailRequest) return null

      return MongooseEmailRequestMapper.toDomain(emailRequest)
    } catch (error) {
      this.winston.logDatabaseQuery({
        query: 'SELECT email request by id',
        duration: Date.now() - startTime,
        success: false,
        table: 'email_requests',
        operation: 'SELECT',
        error: (error as Error).message,
      })
      this.metrics.recordDbMetrics(
        'SELECT',
        'email_requests',
        Date.now() - startTime,
        false,
      )

      throw error
    }
  }

  async findPending(
    limit: number,
    offset: number = 0,
  ): Promise<Array<EmailRequest<EmailTemplateType>>> {
    const startTime = Date.now()

    try {
      const emailRequests = await this.emailRequestModel
        .find({ status: 'pending' as MongooseEmailRequest['status'] })
        .limit(limit)
        .skip(offset)
        .lean()
        .exec()

      this.winston.logDatabaseQuery({
        query: 'SELECT pending email requests',
        duration: Date.now() - startTime,
        success: true,
        table: 'email_requests',
        operation: 'SELECT',
      })
      this.metrics.recordDbMetrics(
        'SELECT',
        'email_requests',
        Date.now() - startTime,
        true,
      )

      return emailRequests.map(MongooseEmailRequestMapper.toDomain)
    } catch (error) {
      this.winston.logDatabaseQuery({
        query: 'SELECT pending email requests',
        duration: Date.now() - startTime,
        success: false,
        table: 'email_requests',
        operation: 'SELECT',
        error: (error as Error).message,
      })
      this.metrics.recordDbMetrics(
        'SELECT',
        'email_requests',
        Date.now() - startTime,
        false,
      )

      throw error
    }
  }

  async findByStatusAndPriority(
    status: EmailStatus,
    priority: EmailPriority,
    limit: number,
    offset: number = 0,
  ): Promise<Array<EmailRequest<EmailTemplateType>>> {
    const startTime = Date.now()

    try {
      const emailRequests = await this.emailRequestModel
        .find({ status, priority })
        .limit(limit)
        .skip(offset)
        .lean()
        .exec()

      this.winston.logDatabaseQuery({
        query: 'SELECT email requests by status and priority',
        duration: Date.now() - startTime,
        success: true,
        table: 'email_requests',
        operation: 'SELECT',
      })
      this.metrics.recordDbMetrics(
        'SELECT',
        'email_requests',
        Date.now() - startTime,
        true,
      )

      return emailRequests.map(MongooseEmailRequestMapper.toDomain)
    } catch (error) {
      this.winston.logDatabaseQuery({
        query: 'SELECT email requests by status and priority',
        duration: Date.now() - startTime,
        success: false,
        table: 'email_requests',
        operation: 'SELECT',
        error: (error as Error).message,
      })
      this.metrics.recordDbMetrics(
        'SELECT',
        'email_requests',
        Date.now() - startTime,
        false,
      )

      throw error
    }
  }

  async create(emailRequest: EmailRequest<EmailTemplateType>): Promise<void> {
    const startTime = Date.now()

    try {
      const mongooseEmailRequest =
        MongooseEmailRequestMapper.toMongoose(emailRequest)

      await this.emailRequestModel.create(mongooseEmailRequest)

      this.winston.logDatabaseQuery({
        query: 'INSERT email request',
        duration: Date.now() - startTime,
        success: true,
        table: 'email_requests',
        operation: 'INSERT',
      })
      this.metrics.recordDbMetrics(
        'INSERT',
        'email_requests',
        Date.now() - startTime,
        true,
      )
    } catch (error) {
      this.winston.logDatabaseQuery({
        query: 'INSERT email request',
        duration: Date.now() - startTime,
        success: false,
        table: 'email_requests',
        operation: 'INSERT',
        error: (error as Error).message,
      })
      this.metrics.recordDbMetrics(
        'INSERT',
        'email_requests',
        Date.now() - startTime,
        false,
      )

      throw error
    }
  }

  async save(emailRequest: EmailRequest<EmailTemplateType>): Promise<void> {
    const startTime = Date.now()

    try {
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

      this.winston.logDatabaseQuery({
        query: 'UPDATE email request',
        duration: Date.now() - startTime,
        success: true,
        table: 'email_requests',
        operation: 'UPDATE',
      })
      this.metrics.recordDbMetrics(
        'UPDATE',
        'email_requests',
        Date.now() - startTime,
        true,
      )
    } catch (error) {
      this.winston.logDatabaseQuery({
        query: 'UPDATE email request',
        duration: Date.now() - startTime,
        success: false,
        table: 'email_requests',
        operation: 'UPDATE',
        error: (error as Error).message,
      })
      this.metrics.recordDbMetrics(
        'UPDATE',
        'email_requests',
        Date.now() - startTime,
        false,
      )

      throw error
    }
  }
}
