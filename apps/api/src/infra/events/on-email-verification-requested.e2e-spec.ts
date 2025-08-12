import type { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { TestAppModule } from '@test/modules/test-app.module'
import { createIsolatedWorkersTestSetup } from '@test/utils/create-isolated-workers-test-setup'
import { waitFor } from '@test/utils/wait-for'
import type { Model } from 'mongoose'
import request from 'supertest'

import { DomainEvents } from '@/core/events/domain-events'
import { EmailVerificationRequestedEvent } from '@/domain/auth/enterprise/events/email-verification-requested-event'

import { MongooseService } from '../database/mongoose/mongoose.service'
import {
  type EmailRequest as MongooseEmailRequest,
  EmailRequestSchema,
} from '../database/mongoose/schemas/email-request.schema'
import { QueueService } from '../workers/queue/contracts/queue-service'

describe('On email verification requested (E2E)', () => {
  let app: INestApplication
  let mongoose: MongooseService
  let queue: QueueService
  let emailRequestModel: Model<MongooseEmailRequest>

  beforeAll(async () => {
    const { setupTestModule } = createIsolatedWorkersTestSetup()

    const moduleRef = await setupTestModule(
      Test.createTestingModule({
        imports: [TestAppModule],
      }),
    ).compile()

    app = moduleRef.createNestApplication()
    mongoose = moduleRef.get(MongooseService)
    queue = moduleRef.get(QueueService)

    emailRequestModel = mongoose.connection.model<MongooseEmailRequest>(
      'EmailRequest',
      EmailRequestSchema,
    )

    DomainEvents.shouldRun = true
    DomainEvents.restrictToEvents([EmailVerificationRequestedEvent.name])

    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should send a email for verification when user is registered', async () => {
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
        eventType: 'email_verification',
      })

      expect(emailRequestOnDatabase).not.toBeNull()
    })

    const jobs = await queue
      .getEmailQueue()
      .getJobs(['waiting', 'active', 'completed'])

    expect(jobs).not.toHaveLength(0)
    expect(jobs[0].data).toEqual(
      expect.objectContaining({ emailRequestId: expect.any(String) }),
    )
  })
})
