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

  it('[POST] /upload-avatar | invalid input date', async () => {
    const { signedCookie } =
      await authenticateUserFactory.makeAuthenticatedUser()

    const response = await request(app.getHttpServer())
      .post('/upload-avatar')
      .set('Cookie', signedCookie)
      .expect(400)

    expect(response.body).toMatchObject({
      message: 'Nenhum arquivo foi enviado. Por favor, envie um arquivo.',
      statusCode: 400,
      errors: {
        type: 'validation',
        details: [
          {
            filed: 'file',
            message: 'Arquivo é obrigatório.',
          },
        ],
      },
    })
  })

  it('[POST] /upload-avatar | invalid media size', async () => {
    const { signedCookie } =
      await authenticateUserFactory.makeAuthenticatedUser()

    const largeFileBuffer = Buffer.alloc(3 * 1024 * 1024, 'a') // 3MB

    const response = await request(app.getHttpServer())
      .post('/upload-avatar')
      .set('Cookie', signedCookie)
      .attach('file', largeFileBuffer, {
        filename: 'large-image.jpg',
        contentType: 'image/jpg',
      })
      .expect(400)

    expect(response.body).toMatchObject({
      message: 'O arquivo excede o tamanho máximo permitido de 2MB.',
      statusCode: 400,
      errors: {
        type: 'validation',
        details: [
          {
            filed: 'file',
            message: 'O arquivo excede o tamanho máximo permitido de 2MB.',
          },
        ],
      },
    })
  })

  it('[POST] /upload-avatar | invalid media type', async () => {
    const { signedCookie } =
      await authenticateUserFactory.makeAuthenticatedUser()

    const fileBuffer = Buffer.alloc(1 * 1024, 'a') // 1KB

    const response = await request(app.getHttpServer())
      .post('/upload-avatar')
      .set('Cookie', signedCookie)
      .attach('file', fileBuffer, {
        filename: 'sample.pdf',
        contentType: 'application/pdf',
      })
      .expect(400)

    expect(response.body).toMatchObject({
      message:
        'O tipo de arquivo não é suportado. Use apenas arquivos png, jpg, jpeg ou webp.',
      statusCode: 400,
      errors: {
        type: 'validation',
        details: [
          {
            filed: 'file',
            message:
              'O tipo de arquivo não é suportado. Use apenas arquivos png, jpg, jpeg ou webp.',
          },
        ],
      },
    })
  })

  it('[POST] /upload-avatar | user not found', async () => {
    const { user, signedCookie } =
      await authenticateUserFactory.makeAuthenticatedUser()
    await typeorm.getRepository(User).delete(user.id.toString())

    const response = await request(app.getHttpServer())
      .post('/upload-avatar')
      .set('Cookie', signedCookie)
      .attach('file', './test/e2e/sample-upload.jpg')
      .expect(404)

    expect(response.body).toMatchObject({
      message: 'Usuário não encontrado.',
      error: 'Not Found',
      statusCode: 404,
    })
  })
})
