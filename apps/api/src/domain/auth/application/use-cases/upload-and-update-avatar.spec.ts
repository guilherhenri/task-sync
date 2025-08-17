import { makeUser } from '@test/factories/make-user'
import { InMemoryUsersRepository } from '@test/repositories/in-memory-users-repository'
import { FakeUploader } from '@test/storage/fake-uploader'

import { InvalidAvatarTypeError } from './errors/invalid-avatar-type'
import { ResourceNotFoundError } from './errors/resource-not-found'
import { UploadAndUpdateAvatarUseCase } from './upload-and-update-avatar'

let inMemoryUsersRepository: InMemoryUsersRepository
let fakeUploader: FakeUploader
let sut: UploadAndUpdateAvatarUseCase

describe('Upload and Update Avatar Use-case', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    fakeUploader = new FakeUploader()
    sut = new UploadAndUpdateAvatarUseCase(
      inMemoryUsersRepository,
      fakeUploader,
    )
  })

  it("should be able to upload and update a user's avatar", async () => {
    const user = makeUser({ avatarUrl: null })
    inMemoryUsersRepository.items.push(user)

    const response = await sut.execute({
      userId: user.id.toString(),
      fileName: 'avatar.png',
      fileType: 'image/png',
      body: Buffer.from(''),
    })

    expect(response.isRight()).toBeTruthy()
    expect(inMemoryUsersRepository.items[0].avatarUrl).toEqual(
      expect.any(String),
    )
    expect(fakeUploader.uploads).toHaveLength(1)
    expect(fakeUploader.uploads[0]).toEqual(
      expect.objectContaining({
        fileName: 'avatar.png',
        url: expect.any(String),
      }),
    )
  })

  it('should be able to delete the old avatar when a newer is uploaded', async () => {
    const user = makeUser({ avatarUrl: 'http://old-avatar.png' })
    inMemoryUsersRepository.items.push(user)
    fakeUploader.uploads.push({
      fileName: 'old-avatar.png',
      url: 'http://old-avatar.png',
    })

    const response = await sut.execute({
      userId: user.id.toString(),
      fileName: 'new-avatar.png',
      fileType: 'image/png',
      body: Buffer.from(''),
    })

    expect(response.isRight()).toBeTruthy()
    expect(inMemoryUsersRepository.items[0].avatarUrl).not.toEqual(
      'http://old-avatar.png',
    )
    expect(fakeUploader.uploads).toHaveLength(1)
  })

  it('should not be able to upload an avatar for an invalid user', async () => {
    const response = await sut.execute({
      userId: 'invalid-user',
      fileName: 'avatar.png',
      fileType: 'image/png',
      body: Buffer.from(''),
    })

    expect(response.isLeft()).toBeTruthy()
    expect(response.value).toBeInstanceOf(ResourceNotFoundError)
    expect(response.value).toHaveProperty('message', 'Usuário não encontrado.')
  })

  it('should not be able to upload an avatar with invalid file type', async () => {
    const user = makeUser({ avatarUrl: null })
    inMemoryUsersRepository.items.push(user)

    const response = await sut.execute({
      userId: user.id.toString(),
      fileName: 'avatar.pdf',
      fileType: 'application/pdf',
      body: Buffer.from(''),
    })

    expect(response.isLeft()).toBeTruthy()
    expect(response.value).toBeInstanceOf(InvalidAvatarTypeError)
    expect(inMemoryUsersRepository.items[0].avatarUrl).toBeNull()
    expect(fakeUploader.uploads).toHaveLength(0)
  })
})
