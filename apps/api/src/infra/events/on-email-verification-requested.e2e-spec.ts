import type { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { waitFor } from '@test/utils/wait-for'
import type { Model } from 'mongoose'
import request from 'supertest'

import { DomainEvents } from '@/core/events/domain-events'
import { AppModule } from '@/infra/app.module'

import { MongooseService } from '../database/mongoose/mongoose.service'
import {
  type EmailRequest as MongooseEmailRequest,
  EmailRequestSchema,
} from '../database/mongoose/schemas/email-request.schema'

describe('On email verification requested (E2E)', () => {
  let app: INestApplication
  let mongoose: MongooseService
  let emailRequestModel: Model<MongooseEmailRequest>

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()

    mongoose = moduleRef.get(MongooseService)
    emailRequestModel = mongoose.connection.model<MongooseEmailRequest>(
      'EmailRequest',
      EmailRequestSchema,
    )

    DomainEvents.shouldRun = true

    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should send a email for verification when user is registered', async () => {
    await request(app.getHttpServer()).post('/sign-up').send({
      name: 'John Doe',
      email: 'johndoe@email.com',
      password: '12345Ab@',
    })

    await waitFor(async () => {
      const emailRequestOnDatabase = await emailRequestModel.findOne({
        recipientEmail: 'johndoe@email.com',
        eventType: 'email_verification',
        status: 'sent',
      })

      expect(emailRequestOnDatabase).not.toBeNull()
    }, 5000)
  }, 6000)
})
