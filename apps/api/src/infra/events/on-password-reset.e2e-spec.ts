import type { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { UserFactory } from '@test/factories/make-user'
import { VerificationTokenFactory } from '@test/factories/make-verification-token'
import { TestAppModule } from '@test/modules/test-app.module'
import { createIsolatedWorkersTestSetup } from '@test/utils/create-isolated-workers-test-setup'
import { waitFor } from '@test/utils/wait-for'
import type { Model } from 'mongoose'
import request from 'supertest'

import { DomainEvents } from '@/core/events/domain-events'
import { PasswordResetEvent } from '@/domain/auth/enterprise/events/password-reset-event'

import { DatabaseModule } from '../database/database.module'
import { MongooseService } from '../database/mongoose/mongoose.service'
import {
  type EmailRequest as MongooseEmailRequest,
  EmailRequestSchema,
} from '../database/mongoose/schemas/email-request.schema'
import { KeyValueModule } from '../key-value/key-value.module'
import { QueueService } from '../workers/queue/contracts/queue-service'

describe('On password reset (E2E)', () => {
  let app: INestApplication
  let mongoose: MongooseService
  let queue: QueueService
  let emailRequestModel: Model<MongooseEmailRequest>
  let userFactory: UserFactory
  let verificationTokenFactory: VerificationTokenFactory

  beforeAll(async () => {
    const { setupTestModule } = createIsolatedWorkersTestSetup()

    const moduleRef = await setupTestModule(
      Test.createTestingModule({
        imports: [TestAppModule, DatabaseModule, KeyValueModule],
        providers: [UserFactory, VerificationTokenFactory],
      }),
    ).compile()

    app = moduleRef.createNestApplication()
    mongoose = moduleRef.get(MongooseService)
    queue = moduleRef.get(QueueService)
    userFactory = moduleRef.get(UserFactory)
    verificationTokenFactory = moduleRef.get(VerificationTokenFactory)

    emailRequestModel = mongoose.connection.model<MongooseEmailRequest>(
      'EmailRequest',
      EmailRequestSchema,
    )

    DomainEvents.shouldRun = true
    DomainEvents.restrictToEvents([PasswordResetEvent.name])

    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  it("should send a email for warning when a user's password is reset", async () => {
    const user = await userFactory.makeTypeOrmUser({
      email: 'johndoe@email.com',
    })
    const verificationToken =
      await verificationTokenFactory.makeRedisVerificationToken({
        userId: user.id,
        type: 'password:recovery',
      })

    await request(app.getHttpServer())
      .post('/reset-password')
      .send({
        token: verificationToken.token,
        newPassword: '12345Ab@',
      })
      .expect(200)

    await waitFor(async () => {
      const emailRequestOnDatabase = await emailRequestModel.findOne({
        recipientEmail: 'johndoe@email.com',
        eventType: 'password_reset',
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
