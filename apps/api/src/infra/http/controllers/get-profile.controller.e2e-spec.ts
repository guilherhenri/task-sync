import type { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { AuthenticateUserFactory } from '@test/factories/make-user'
import { AuthTestModule } from '@test/modules/auth-test.module'
import request from 'supertest'

describe('Get profile (E2E)', () => {
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

  it('[GET] /me', async () => {
    const { signedCookie } =
      await authenticateUserFactory.makeAuthenticatedUser({
        name: 'John Doe',
        email: 'johndoe@email.com',
      })

    const response = await request(app.getHttpServer())
      .get('/me')
      .set('Cookie', signedCookie)
      .expect(200)

    expect(response.body).toEqual(
      expect.objectContaining({
        profile: {
          id: expect.any(String),
          name: 'John Doe',
          email: 'johndoe@email.com',
          avatar_url: expect.anything(),
          created_at: expect.any(String),
        },
      }),
    )
  })
})
