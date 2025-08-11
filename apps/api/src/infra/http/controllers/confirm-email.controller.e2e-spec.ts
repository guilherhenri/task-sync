import type { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { TestAppModule } from '@test/modules/test-app.module'
import request from 'supertest'

import { User } from '@/infra/database/typeorm/entities/user.entity'
import { TypeOrmService } from '@/infra/database/typeorm/typeorm.service'
import { RedisVerificationTokenMapper } from '@/infra/key-value/redis/mappers/redis-verification-token-mapper'
import { RedisService } from '@/infra/key-value/redis/redis.service'

describe('Confirm Email (E2E)', () => {
  let app: INestApplication
  let typeorm: TypeOrmService
  let redis: RedisService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [TestAppModule],
    }).compile()

    app = moduleRef.createNestApplication()

    typeorm = moduleRef.get(TypeOrmService)
    redis = moduleRef.get(RedisService)

    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  it('[POST] /confirm-email', async () => {
    await request(app.getHttpServer())
      .post('/sign-up')
      .send({
        name: 'John Doe',
        email: 'johndoe@email.com',
        password: '12345Ab@',
      })
      .expect(201)

    const user = await typeorm.getRepository(User).findOne({
      where: {
        email: 'johndoe@email.com',
      },
    })

    const keys = await redis.keys(`${user?.id}:email:verify:*`)

    const value = await redis.get(keys[0])

    if (!value) return

    const { token } = RedisVerificationTokenMapper.toDomain(value)

    await request(app.getHttpServer())
      .get('/confirm-email')
      .query({ token })
      .expect(200)

    const userUpdated = await typeorm.getRepository(User).findOne({
      where: {
        email: 'johndoe@email.com',
      },
    })

    expect(userUpdated?.emailVerified).toBeTruthy()
  })
})
