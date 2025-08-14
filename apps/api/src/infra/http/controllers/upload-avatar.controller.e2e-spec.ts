import type { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { AuthenticateUserFactory } from '@test/factories/make-user'
import { AuthTestModule } from '@test/modules/auth-test.module'
import request from 'supertest'

import { FileStorage } from '@/domain/auth/application/storage/file-storage'
import { User } from '@/infra/database/typeorm/entities/user.entity'
import { TypeOrmService } from '@/infra/database/typeorm/typeorm.service'

describe('Register (E2E)', () => {
  let app: INestApplication
  let typeorm: TypeOrmService
  let storage: FileStorage
  let authenticateUserFactory: AuthenticateUserFactory

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AuthTestModule],
      providers: [AuthenticateUserFactory],
    }).compile()

    app = moduleRef.createNestApplication()
    typeorm = moduleRef.get(TypeOrmService)
    storage = moduleRef.get(FileStorage)
    authenticateUserFactory = moduleRef.get(AuthenticateUserFactory)

    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  it('[POST] /upload-avatar', async () => {
    const { user, signedCookie } =
      await authenticateUserFactory.makeAuthenticatedUser({
        avatarUrl: null,
      })

    const response = await request(app.getHttpServer())
      .post('/upload-avatar')
      .set('Cookie', signedCookie)
      .attach('file', './test/e2e/sample-upload.jpg')
      .expect(200)

    expect(response.body).toEqual(
      expect.objectContaining({
        avatar_url: expect.any(String),
      }),
    )

    const userOnDatabase = await typeorm.getRepository(User).findOne({
      where: { id: user.id.toString() },
    })

    expect(userOnDatabase?.avatarUrl).toEqual(response.body.avatar_url)
    expect(userOnDatabase?.avatarUrl?.split('.')[1]).toEqual('jpg')

    await storage.delete(response.body.avatar_url)
  })
})
