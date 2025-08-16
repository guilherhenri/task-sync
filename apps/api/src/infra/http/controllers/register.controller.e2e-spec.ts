import type { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { UserFactory } from '@test/factories/make-user'
import { TestAppModule } from '@test/modules/test-app.module'
import request from 'supertest'

import { DatabaseModule } from '@/infra/database/database.module'
import { User } from '@/infra/database/typeorm/entities/user.entity'
import { TypeOrmService } from '@/infra/database/typeorm/typeorm.service'

describe('Register (E2E)', () => {
  let app: INestApplication
  let typeorm: TypeOrmService
  let userFactory: UserFactory

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [TestAppModule, DatabaseModule],
      providers: [UserFactory],
    }).compile()

    app = moduleRef.createNestApplication()
    typeorm = moduleRef.get(TypeOrmService)
    userFactory = moduleRef.get(UserFactory)

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

  it('[POST] /sign-up | invalid input data', async () => {
    const response = await request(app.getHttpServer())
      .post('/sign-up')
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
            field: 'name',
            message: 'O nome é obrigatório.',
          },
          {
            field: 'email',
            message: 'O e-mail deve ser válido.',
          },
          {
            field: 'password',
            message: 'A senha é obrigatória.',
          },
        ],
      },
    })
  })

  it('[POST] /sign-up | email already in use', async () => {
    await userFactory.makeTypeOrmUser({ email: 'alreadyinuse@gmail.com' })

    const response = await request(app.getHttpServer())
      .post('/sign-up')
      .send({
        name: 'John Doe',
        email: 'alreadyinuse@gmail.com',
        password: '12345Ab@',
      })
      .expect(409)

    expect(response.body).toMatchObject({
      message: `O e-mail "alreadyinuse@gmail.com" já está em uso.`,
      error: 'Conflict',
      statusCode: 409,
    })
  })
})
