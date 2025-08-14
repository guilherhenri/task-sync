import type { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { AuthenticateUserFactory } from '@test/factories/make-user'
import { AuthTestModule } from '@test/modules/auth-test.module'
import request from 'supertest'

import { Hasher } from '@/domain/auth/application/cryptography/hasher'
import { User } from '@/infra/database/typeorm/entities/user.entity'
import { TypeOrmService } from '@/infra/database/typeorm/typeorm.service'

describe('Register (E2E)', () => {
  let app: INestApplication
  let typeorm: TypeOrmService
  let hasher: Hasher
  let authenticateUserFactory: AuthenticateUserFactory

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AuthTestModule],
      providers: [AuthenticateUserFactory],
    }).compile()

    app = moduleRef.createNestApplication()
    typeorm = moduleRef.get(TypeOrmService)
    hasher = moduleRef.get(Hasher)
    authenticateUserFactory = moduleRef.get(AuthenticateUserFactory)

    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  it('[PUT] /me', async () => {
    const passwordHash = await hasher.hash('12345Ab@')
    const { user, signedCookie } =
      await authenticateUserFactory.makeAuthenticatedUser({
        name: 'John Doe',
        email: 'johndoe@email.com',
        passwordHash,
        emailVerified: true,
      })

    await request(app.getHttpServer())
      .put('/me')
      .send({
        name: 'José',
        email: 'jose@email.com',
        newPassword: '@Ab54321',
      })
      .set('Cookie', signedCookie)
      .expect(200)

    const updatedUerOnDatabase = await typeorm.getRepository(User).findOne({
      where: { id: user.id.toString() },
    })

    expect(updatedUerOnDatabase).toBeTruthy()
    expect(updatedUerOnDatabase).toEqual(
      expect.objectContaining({
        id: user.id.toString(),
        name: 'José',
        email: 'jose@email.com',
        emailVerified: false,
        updatedAt: expect.any(Date),
      }),
    )
    expect(
      await hasher.compare(
        '@Ab54321',
        updatedUerOnDatabase?.passwordHash ?? '',
      ),
    ).toBeTruthy()
  })
})
