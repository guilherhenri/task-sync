import type { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { AuthenticateUserFactory } from '@test/factories/make-user'
import { AuthTestModule } from '@test/modules/auth-test.module'
import { createIsolatedWorkersTestSetup } from '@test/utils/create-isolated-workers-test-setup'
import { waitFor } from '@test/utils/wait-for'
import type { Model } from 'mongoose'
import request from 'supertest'

import { DomainEvents } from '@/core/events/domain-events'
import { EmailUpdateVerificationRequestedEvent } from '@/domain/auth/enterprise/events/email-update-verification-requested-event'

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
  let authenticateUserFactory: AuthenticateUserFactory

  beforeAll(async () => {
    const { setupTestModule } = createIsolatedWorkersTestSetup()

    const moduleRef = await setupTestModule(
      Test.createTestingModule({
        imports: [AuthTestModule],
        providers: [AuthenticateUserFactory],
      }),
    ).compile()

    app = moduleRef.createNestApplication()
    mongoose = moduleRef.get(MongooseService)
    queue = moduleRef.get(QueueService)
    authenticateUserFactory = moduleRef.get(AuthenticateUserFactory)

    emailRequestModel = mongoose.connection.model<MongooseEmailRequest>(
      'EmailRequest',
      EmailRequestSchema,
    )

    DomainEvents.shouldRun = true
    DomainEvents.restrictToEvents([EmailUpdateVerificationRequestedEvent.name])

    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  it("should create a verification email request and add a job to queue when the user's email is updated", async () => {
    const { signedCookie } =
      await authenticateUserFactory.makeAuthenticatedUser({
        email: 'johndoe@email.com',
        emailVerified: true,
      })

    await request(app.getHttpServer())
      .put('/me')
      .send({
        name: 'José',
        email: 'jose@email.com',
      })
      .set('Cookie', signedCookie)
      .expect(200)

    await waitFor(async () => {
      const emailRequestOnDatabase = await emailRequestModel.findOne({
        recipientEmail: 'jose@email.com',
        eventType: 'email_update_verification',
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
