import type { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { UserFactory } from '@test/factories/make-user'
import { TestAppModule } from '@test/modules/test-app.module'
import request from 'supertest'

import { Hasher } from '@/domain/auth/application/cryptography/hasher'
import { DatabaseModule } from '@/infra/database/database.module'

describe('Authenticate (E2E)', () => {
  let app: INestApplication
  let userFactory: UserFactory
  let hasher: Hasher

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [TestAppModule, DatabaseModule],
      providers: [UserFactory],
    }).compile()

    app = moduleRef.createNestApplication()

    hasher = moduleRef.get(Hasher)
    userFactory = moduleRef.get(UserFactory)

    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  it('[POST] /sessions', async () => {
    const passwordHash = await hasher.hash('12345Ab@')
    await userFactory.makeTypeOrmUser({
      email: 'johndoe@email.com',
      passwordHash,
    })

    const response = await request(app.getHttpServer()).post('/sessions').send({
      email: 'johndoe@email.com',
      password: '12345Ab@',
    })

    expect(response.statusCode).toBe(200)
  })
})
