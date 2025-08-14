import fs from 'node:fs'
import path from 'node:path'

import type { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { AuthenticateUserFactory } from '@test/factories/make-user'
import { AuthTestModule } from '@test/modules/auth-test.module'
import request from 'supertest'

import { FileStorage } from '@/domain/auth/application/storage/file-storage'

describe('Get Avatar Url (E2E)', () => {
  let app: INestApplication
  let storage: FileStorage
  let authenticateUserFactory: AuthenticateUserFactory

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AuthTestModule],
      providers: [AuthenticateUserFactory],
    }).compile()

    app = moduleRef.createNestApplication()
    storage = moduleRef.get(FileStorage)
    authenticateUserFactory = moduleRef.get(AuthenticateUserFactory)

    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  it('[GET] /avatar/url/:key', async () => {
    const filePath = path.resolve(
      __dirname,
      '..',
      '..',
      '..',
      '..',
      'test',
      'e2e',
      'sample-upload.jpg',
    )
    const file = fs.readFileSync(filePath)

    const { url } = await storage.upload({
      fileName: 'sample-upload.jpg',
      fileType: 'image/jpg',
      body: file,
    })

    expect(url).toEqual(expect.any(String))

    const { signedCookie } =
      await authenticateUserFactory.makeAuthenticatedUser({ avatarUrl: url })

    const response = await request(app.getHttpServer())
      .get(`/avatar/url/${url}`)
      .set('Cookie', signedCookie)
      .expect(200)

    expect(response.body).toMatchObject({
      url: expect.any(String),
      expires_at: expect.any(String),
    })

    expect(response.body.url).toMatch(
      /^https:\/\/.*\.supabase\.co\/storage\/v1\/object\/sign\/user-avatars-test\/.*\.jpg/,
    )
    const urlParams = new URL(response.body.url).searchParams
    expect(urlParams.get('token')).toBeTruthy()

    const expiresAt = new Date(response.body.expires_at)
    expect(expiresAt).toBeInstanceOf(Date)
    expect(expiresAt > new Date()).toBe(true)

    await storage.delete(url)
  })
})
