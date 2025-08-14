import type { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { UserFactory } from '@test/factories/make-user'
import { VerificationTokenFactory } from '@test/factories/make-verification-token'
import { TestAppModule } from '@test/modules/test-app.module'
import request from 'supertest'

import { Hasher } from '@/domain/auth/application/cryptography/hasher'
import { DatabaseModule } from '@/infra/database/database.module'
import { User } from '@/infra/database/typeorm/entities/user.entity'
import { TypeOrmService } from '@/infra/database/typeorm/typeorm.service'
import { KeyValueModule } from '@/infra/key-value/key-value.module'

describe('Reset Password (E2E)', () => {
  let app: INestApplication
  let typeorm: TypeOrmService
  let hasher: Hasher
  let userFactory: UserFactory
  let verificationTokenFactory: VerificationTokenFactory

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [TestAppModule, DatabaseModule, KeyValueModule],
      providers: [UserFactory, VerificationTokenFactory],
    }).compile()

    app = moduleRef.createNestApplication()

    typeorm = moduleRef.get(TypeOrmService)
    hasher = moduleRef.get(Hasher)
    userFactory = moduleRef.get(UserFactory)
    verificationTokenFactory = moduleRef.get(VerificationTokenFactory)

    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  it('[POST] /reset-password', async () => {
    const passwordHash = await hasher.hash('12345678')
    const user = await userFactory.makeTypeOrmUser({
      email: 'johndoe@email.com',
      passwordHash,
      emailVerified: true,
    })
    const { token } = await verificationTokenFactory.makeRedisVerificationToken(
      {
        userId: user.id,
        type: 'password:recovery',
      },
    )

    await request(app.getHttpServer())
      .post('/reset-password')
      .send({ token, newPassword: '12345Ab@' })
      .expect(200)

    const userUpdated = await typeorm.getRepository(User).findOne({
      where: {
        id: user.id.toString(),
      },
    })

    expect(userUpdated).not.toBeNull()
    expect(
      await hasher.compare('12345Ab@', userUpdated?.passwordHash ?? ''),
    ).toBeTruthy()
  })
})
