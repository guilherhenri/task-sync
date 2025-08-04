import { makeUser } from '@test/factories/make-user'
import { InMemoryUsersRepository } from '@test/repositories/in-memory-users-repository'

import { UpdateAvatarUseCase } from './update-avatar'

let inMemoryUsersRepository: InMemoryUsersRepository
let sut: UpdateAvatarUseCase

describe('Update Avatar Use-case', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    sut = new UpdateAvatarUseCase(inMemoryUsersRepository)
  })

  it("should be able to update user's avatar with a valid URL", async () => {
    const user = makeUser({
      avatarUrl: 'https://avatar-placeholder.com',
    })
    inMemoryUsersRepository.items.push(user)

    const response = await sut.execute({
      userId: user.id.toString(),
      avatarUrl: 'https://new-avatar.com',
    })

    expect(response.isRight()).toBeTruthy()
    expect(inMemoryUsersRepository.items[0].avatarUrl).toEqual(
      'https://new-avatar.com',
    )
  })

  it("should be able to update user's avatar with a HTTP or HTTPS URL", async () => {
    const user = makeUser({
      avatarUrl: 'https://avatar-placeholder.com',
    })
    inMemoryUsersRepository.items.push(user)

    const response = await sut.execute({
      userId: user.id.toString(),
      avatarUrl: 'http://new-avatar.com',
    })

    expect(response.isRight()).toBeTruthy()
    expect(inMemoryUsersRepository.items[0].avatarUrl).toEqual(
      'http://new-avatar.com',
    )
  })

  it("should not be able to update user's avatar for a invalid user", async () => {
    const response = await sut.execute({
      userId: 'invalid-user',
      avatarUrl: 'https://new-avatar.com',
    })

    expect(response.isLeft()).toBeTruthy()
    expect(response.value).toHaveProperty('message', 'Usuário não encontrado.')
  })

  it("should not be able to update user's avatar with an invalid URL", async () => {
    const user = makeUser()
    inMemoryUsersRepository.items.push(user)

    const response = await sut.execute({
      userId: user.id.toString(),
      avatarUrl: 'invalid-url',
    })

    expect(response.isLeft()).toBeTruthy()
    expect(response.value).toHaveProperty('message', 'URL inválida.')
  })
})
