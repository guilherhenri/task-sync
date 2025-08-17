import type { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { AuthenticateUserFactory, UserFactory } from '@test/factories/make-user'
import { AuthTestModule } from '@test/modules/auth-test.module'
import request from 'supertest'

import { Hasher } from '@/domain/auth/application/cryptography/hasher'
import { User } from '@/infra/database/typeorm/entities/user.entity'
import { TypeOrmService } from '@/infra/database/typeorm/typeorm.service'

describe('Register (E2E)', () => {
  let app: INestApplication
  let typeorm: TypeOrmService
  let hasher: Hasher
  let userFactory: UserFactory
  let authenticateUserFactory: AuthenticateUserFactory

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AuthTestModule],
      providers: [UserFactory, AuthenticateUserFactory],
    }).compile()

    app = moduleRef.createNestApplication()
    typeorm = moduleRef.get(TypeOrmService)
    hasher = moduleRef.get(Hasher)
    userFactory = moduleRef.get(UserFactory)
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

  it('[PUT] /me | invalid input data', async () => {
    const { signedCookie } =
      await authenticateUserFactory.makeAuthenticatedUser()

    const response = await request(app.getHttpServer())
      .put('/me')
      .send({
        email: 'jose',
        newPassword: '123',
      })
      .set('Cookie', signedCookie)
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
            field: 'newPassword',
            message: 'A senha deve ter no mínimo 8 caracteres.',
          },
          {
            field: 'newPassword',
            message: 'A senha deve conter pelo menos uma letra maiúscula.',
          },
          {
            field: 'newPassword',
            message: 'A senha deve conter pelo menos uma letra minúscula.',
          },
          {
            field: 'newPassword',
            message: 'A senha deve conter pelo menos um caractere especial.',
          },
        ],
      },
    })
  })

  it('[PUT] /me | email already in use', async () => {
    await userFactory.makeTypeOrmUser({ email: 'alreadyinuse@gmail.com' })
    const { signedCookie } =
      await authenticateUserFactory.makeAuthenticatedUser()

    const response = await request(app.getHttpServer())
      .put('/me')
      .send({
        name: 'José',
        email: 'alreadyinuse@gmail.com',
        newPassword: '@Ab54321',
      })
      .set('Cookie', signedCookie)
      .expect(409)

    expect(response.body).toMatchObject({
      message: `O e-mail "alreadyinuse@gmail.com" já está em uso.`,
      error: 'Conflict',
      statusCode: 409,
    })
  })

  it('[PUT] /me | user not found', async () => {
    const { user, signedCookie } =
      await authenticateUserFactory.makeAuthenticatedUser()
    await typeorm.getRepository(User).delete(user.id.toString())

    const response = await request(app.getHttpServer())
      .put('/me')
      .send({
        name: 'José',
        email: 'jose@email.com',
        newPassword: '@Ab54321',
      })
      .set('Cookie', signedCookie)
      .expect(404)

    expect(response.body).toMatchObject({
      message: 'Usuário não encontrado.',
      error: 'Not Found',
      statusCode: 404,
    })
  })
})
