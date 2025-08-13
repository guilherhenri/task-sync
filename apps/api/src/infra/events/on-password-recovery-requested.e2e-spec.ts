import type { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { UserFactory } from '@test/factories/make-user'
import { TestAppModule } from '@test/modules/test-app.module'
import { createIsolatedWorkersTestSetup } from '@test/utils/create-isolated-workers-test-setup'
import { waitFor } from '@test/utils/wait-for'
import type { Model } from 'mongoose'
import request from 'supertest'

import { DomainEvents } from '@/core/events/domain-events'
import { PasswordRecoveryRequestedEvent } from '@/domain/auth/enterprise/events/password-recovery-requested-event'

import { DatabaseModule } from '../database/database.module'
import { MongooseService } from '../database/mongoose/mongoose.service'
import {
  type EmailRequest as MongooseEmailRequest,
  EmailRequestSchema,
} from '../database/mongoose/schemas/email-request.schema'
import { QueueService } from '../workers/queue/contracts/queue-service'

describe('On password recovery requested (E2E)', () => {
  let app: INestApplication
  let mongoose: MongooseService
  let queue: QueueService
  let emailRequestModel: Model<MongooseEmailRequest>
  let userFactory: UserFactory

  beforeAll(async () => {
    const { setupTestModule } = createIsolatedWorkersTestSetup()

    const moduleRef = await setupTestModule(
      Test.createTestingModule({
        imports: [TestAppModule, DatabaseModule],
        providers: [UserFactory],
      }),
    ).compile()

    app = moduleRef.createNestApplication()
    mongoose = moduleRef.get(MongooseService)
    queue = moduleRef.get(QueueService)
    userFactory = moduleRef.get(UserFactory)

    emailRequestModel = mongoose.connection.model<MongooseEmailRequest>(
      'EmailRequest',
      EmailRequestSchema,
    )

    DomainEvents.shouldRun = true
    DomainEvents.restrictToEvents([PasswordRecoveryRequestedEvent.name])

    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should create an email request and add a job to the queue when user initiate password recovery', async () => {
    await userFactory.makeTypeOrmUser({
      email: 'johndoe@email.com',
      emailVerified: true,
    })

    await request(app.getHttpServer())
      .post('/forgot-password')
      .send({
        email: 'johndoe@email.com',
      })
      .expect(200)

    await waitFor(async () => {
      const emailRequestOnDatabase = await emailRequestModel.findOne({
        recipientEmail: 'johndoe@email.com',
        eventType: 'password_recovery',
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
