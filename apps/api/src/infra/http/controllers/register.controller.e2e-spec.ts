import type { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'

import { AppModule } from '@/infra/app.module'
import { User } from '@/infra/database/typeorm/entities/user.entity'
import { TypeOrmService } from '@/infra/database/typeorm/typeorm.service'

describe('teste', () => {
  let app: INestApplication
  let typeorm: TypeOrmService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()

    typeorm = moduleRef.get(TypeOrmService)

    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  it('[POST] /sign-up', async () => {
    const response = await request(app.getHttpServer()).post('/sign-up').send({
      name: 'John Doe',
      email: 'johndoe@email.com',
      password: '12345Ab@',
    })

    expect(response.statusCode).toBe(201)

    const userOnDatabase = await typeorm.getRepository(User).findOne({
      where: {
        email: 'johndoe@email.com',
      },
    })

    expect(userOnDatabase).toBeTruthy()
  })
})
