import type { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { AuthTokenFactory } from '@test/factories/make-auth-token'
import { AuthenticateUserFactory } from '@test/factories/make-user'
import { AuthTestModule } from '@test/modules/auth-test.module'
import request from 'supertest'

import { Encryptor } from '@/domain/auth/application/cryptography/encryptor'
import { User } from '@/infra/database/typeorm/entities/user.entity'
import { TypeOrmService } from '@/infra/database/typeorm/typeorm.service'
import { KeyValueModule } from '@/infra/key-value/key-value.module'

describe('Refresh Token (E2E)', () => {
  let app: INestApplication
  let encryptor: Encryptor
  let typeorm: TypeOrmService
  let authenticateUserFactory: AuthenticateUserFactory
  let authTokenFactory: AuthTokenFactory

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AuthTestModule, KeyValueModule],
      providers: [AuthenticateUserFactory, AuthTokenFactory],
    }).compile()

    app = moduleRef.createNestApplication()

    encryptor = moduleRef.get(Encryptor)
    typeorm = moduleRef.get(TypeOrmService)
    authenticateUserFactory = moduleRef.get(AuthenticateUserFactory)
    authTokenFactory = moduleRef.get(AuthTokenFactory)

    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  it('[GET] /auth/refresh', async () => {
    const { user, signedCookie } =
      await authenticateUserFactory.makeAuthenticatedUser()
    const refreshToken = await encryptor.encrypt({ sub: user.id.toString() })
    await authTokenFactory.makeRedisAuthToken({
      userId: user.id,
      refreshToken,
    })

    await request(app.getHttpServer())
      .get('/auth/refresh')
      .set('Cookie', signedCookie)
      .expect(200)
  })

  it('[GET] /auth/refresh | not found user', async () => {
    const { user, signedCookie } =
      await authenticateUserFactory.makeAuthenticatedUser()
    await typeorm.getRepository(User).delete(user.id.toString())

    const response = await request(app.getHttpServer())
      .get('/auth/refresh')
      .set('Cookie', signedCookie)
      .expect(404)

    expect(response.body).toMatchObject({
      message: 'Usuário não encontrado.',
      error: 'Not Found',
      statusCode: 404,
    })
  })

  it('[GET] /auth/refresh | refresh token expired or invalid', async () => {
    const { signedCookie } =
      await authenticateUserFactory.makeAuthenticatedUser()

    const response = await request(app.getHttpServer())
      .get('/auth/refresh')
      .set('Cookie', signedCookie)
      .expect(401)

    expect(response.body).toMatchObject({
      code: 'refresh.expired',
      message: 'Refresh token expirado ou inválido.',
      error: 'Unauthorized',
      statusCode: 401,
    })
  })
})
