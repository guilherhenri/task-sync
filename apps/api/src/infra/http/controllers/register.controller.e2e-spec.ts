import type { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { TestAppModule } from '@test/modules/test-app.module'
import request from 'supertest'

import { User } from '@/infra/database/typeorm/entities/user.entity'
import { TypeOrmService } from '@/infra/database/typeorm/typeorm.service'

describe('Register (E2E)', () => {
  let app: INestApplication
  let typeorm: TypeOrmService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [TestAppModule],
    }).compile()

    app = moduleRef.createNestApplication()

    typeorm = moduleRef.get(TypeOrmService)

    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  it('[POST] /sign-up', async () => {
    await request(app.getHttpServer())
      .post('/sign-up')
      .send({
        name: 'John Doe',
        email: 'johndoe@email.com',
        password: '12345Ab@',
      })
      .expect(201)

    const userOnDatabase = await typeorm.getRepository(User).findOne({
      where: {
        email: 'johndoe@email.com',
      },
    })

    expect(userOnDatabase).toBeTruthy()
  })
})
