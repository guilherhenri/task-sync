import type { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { TestAppModule } from '@test/modules/test-app.module'
import { waitFor } from '@test/utils/wait-for'
import type { Model } from 'mongoose'
import request from 'supertest'

import { DomainEvents } from '@/core/events/domain-events'
import { UserRegisteredEvent } from '@/domain/auth/enterprise/events/user-registered-event'

import { MongooseService } from '../database/mongoose/mongoose.service'
import {
  type EmailRequest as MongooseEmailRequest,
  EmailRequestSchema,
} from '../database/mongoose/schemas/email-request.schema'
import { EmailQueueWorker } from '../workers/queue/contracts/email-queue-worker'
import { QueueService } from '../workers/queue/contracts/queue-service'

describe('On user registered (E2E)', () => {
  let app: INestApplication
  let mongoose: MongooseService
  let queue: QueueService
  let emailRequestModel: Model<MongooseEmailRequest>

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [TestAppModule],
    })
      .overrideProvider(EmailQueueWorker)
      .useFactory({ factory: () => {} })
      .compile()

    app = moduleRef.createNestApplication()
    mongoose = moduleRef.get(MongooseService)
    queue = moduleRef.get(QueueService)

    emailRequestModel = mongoose.connection.model<MongooseEmailRequest>(
      'EmailRequest',
      EmailRequestSchema,
    )

    DomainEvents.shouldRun = true
    DomainEvents.restrictToEvents([UserRegisteredEvent.name])

    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should send a email when user is registered', async () => {
    await request(app.getHttpServer())
      .post('/sign-up')
      .send({
        name: 'John Doe',
        email: 'johndoe@email.com',
        password: '12345Ab@',
      })
      .expect(201)

    await waitFor(async () => {
      const emailRequestOnDatabase = await emailRequestModel.findOne({
        recipientEmail: 'johndoe@email.com',
        eventType: 'user_registered',
      })

      expect(emailRequestOnDatabase).not.toBeNull()
    })

    const jobs = await queue.getEmailQueue().getJobs(['active', 'waiting'])

    expect(jobs).not.toHaveLength(0)
    expect(jobs[0].data).toEqual(
      expect.objectContaining({ emailRequestId: expect.any(String) }),
    )
  })
})
