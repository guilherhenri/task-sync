import type { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { AuthTokenFactory } from '@test/factories/make-auth-token'
import { AuthenticateUserFactory } from '@test/factories/make-user'
import { VerificationTokenFactory } from '@test/factories/make-verification-token'
import { AuthTestModule } from '@test/modules/auth-test.module'
import request from 'supertest'

import { KeyValueModule } from '@/infra/key-value/key-value.module'
import { RedisService } from '@/infra/key-value/redis/redis.service'

describe('Revoke all sessions (E2E)', () => {
  let app: INestApplication
  let redis: RedisService
  let authenticateUserFactory: AuthenticateUserFactory
  let authTokenFactory: AuthTokenFactory
  let verificationTokenFactory: VerificationTokenFactory

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AuthTestModule, KeyValueModule],
      providers: [
        AuthenticateUserFactory,
        AuthTokenFactory,
        VerificationTokenFactory,
      ],
    }).compile()

    app = moduleRef.createNestApplication()
    redis = moduleRef.get(RedisService)
    authenticateUserFactory = moduleRef.get(AuthenticateUserFactory)
    authTokenFactory = moduleRef.get(AuthTokenFactory)
    verificationTokenFactory = moduleRef.get(VerificationTokenFactory)

    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  it('[POST] /sessions/revoke-all', async () => {
    const { user, signedCookie } =
      await authenticateUserFactory.makeAuthenticatedUser()
    await authTokenFactory.makeRedisAuthToken({
      userId: user.id,
    })
    await verificationTokenFactory.makeRedisVerificationToken({
      userId: user.id,
    })

    await request(app.getHttpServer())
      .post('/sessions/revoke-all')
      .set('Cookie', signedCookie)
      .expect(200)

    const userKeys = []
    let cursor = '0'

    do {
      const [nextCursor, keys] = await redis.scan(
        cursor,
        'MATCH',
        `*${user.id.toString()}*`,
        'COUNT',
        100,
      )
      cursor = nextCursor
      userKeys.push(...keys)
    } while (cursor !== '0')

    expect(userKeys).toHaveLength(0)
  })
})
