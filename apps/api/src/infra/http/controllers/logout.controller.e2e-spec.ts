import type { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { AuthenticateUserFactory } from '@test/factories/make-user'
import { AuthTestModule } from '@test/modules/auth-test.module'
import request from 'supertest'

describe('Logout (E2E)', () => {
  let app: INestApplication
  let authenticateUserFactory: AuthenticateUserFactory

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AuthTestModule],
      providers: [AuthenticateUserFactory],
    }).compile()

    app = moduleRef.createNestApplication()

    authenticateUserFactory = moduleRef.get(AuthenticateUserFactory)

    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  it('[DELETE] /sessions', async () => {
    const { signedCookie } =
      await authenticateUserFactory.makeAuthenticatedUser()

    await request(app.getHttpServer())
      .delete('/sessions')
      .set('Cookie', signedCookie)
      .expect(200)
  })
})
