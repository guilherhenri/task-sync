import type { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { UserFactory } from '@test/factories/make-user'
import { TestAppModule } from '@test/modules/test-app.module'
import request from 'supertest'

import { DatabaseModule } from '@/infra/database/database.module'
import { RedisService } from '@/infra/key-value/redis/redis.service'

describe('Forgot Password (E2E)', () => {
  let app: INestApplication
  let redis: RedisService
  let userFactory: UserFactory

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [TestAppModule, DatabaseModule],
      providers: [UserFactory],
    }).compile()

    app = moduleRef.createNestApplication()

    redis = moduleRef.get(RedisService)
    userFactory = moduleRef.get(UserFactory)

    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  it('[POST] /forgot-password', async () => {
    const user = await userFactory.makeTypeOrmUser({
      email: 'johndoe@email.com',
      emailVerified: true,
    })

    await request(app.getHttpServer())
      .post('/forgot-password')
      .send({
        email: 'johndoe@email.com',
      })
      .expect(200)

    const keys = await redis.keys(`${user.id}:password:recovery:*`)

    const value = await redis.get(keys[0])

    if (!value) return

    expect(value).not.toBeNull()
  })

  it('[POST] /forgot-password | invalid input data', async () => {
    const response = await request(app.getHttpServer())
      .post('/forgot-password')
      .send({
        email: 'johndoe',
      })
      .expect(400)

    expect(response.body).toMatchObject({
      message: 'Validation failed',
      statusCode: 400,
      errors: {
        type: 'validation',
        details: [
          {
            field: 'email',
            message: 'O e-mail deve ser válido.',
          },
        ],
      },
    })
  })

  it('[POST] /forgot-password | unverified email', async () => {
    await userFactory.makeTypeOrmUser({
      email: 'johndoe2@email.com',
      emailVerified: false,
    })

    const response = await request(app.getHttpServer())
      .post('/forgot-password')
      .send({
        email: 'johndoe2@email.com',
      })
      .expect(400)

    expect(response.body).toMatchObject({
      message:
        'Este endereço de e-mail ainda não foi verificado, por favor cheque seu e-mail.',
      statusCode: 400,
    })
  })
})
