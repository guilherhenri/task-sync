import type { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { UserFactory } from '@test/factories/make-user'
import { VerificationTokenFactory } from '@test/factories/make-verification-token'
import { TestAppModule } from '@test/modules/test-app.module'
import request from 'supertest'

import { DatabaseModule } from '@/infra/database/database.module'
import { User } from '@/infra/database/typeorm/entities/user.entity'
import { TypeOrmService } from '@/infra/database/typeorm/typeorm.service'
import { KeyValueModule } from '@/infra/key-value/key-value.module'

describe('Confirm Email (E2E)', () => {
  let app: INestApplication
  let typeorm: TypeOrmService
  let userFactory: UserFactory
  let verificationTokenFactory: VerificationTokenFactory

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [TestAppModule, DatabaseModule, KeyValueModule],
      providers: [UserFactory, VerificationTokenFactory],
    }).compile()

    app = moduleRef.createNestApplication()

    typeorm = moduleRef.get(TypeOrmService)
    userFactory = moduleRef.get(UserFactory)
    verificationTokenFactory = moduleRef.get(VerificationTokenFactory)

    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  it('[POST] /confirm-email', async () => {
    const user = await userFactory.makeTypeOrmUser({
      email: 'johndoe@email.com',
    })
    const verificationToken =
      await verificationTokenFactory.makeRedisVerificationToken({
        userId: user.id,
        type: 'email:verify',
      })

    await request(app.getHttpServer())
      .get('/confirm-email')
      .query({ token: verificationToken.token })
      .expect(200)

    const userUpdated = await typeorm.getRepository(User).findOne({
      where: {
        email: 'johndoe@email.com',
      },
    })

    expect(userUpdated?.emailVerified).toBeTruthy()
  })
})
