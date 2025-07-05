import { makeUser } from '@test/factories/make-user'
import { InMemoryUsersRepository } from '@test/repositories/in-memory-users-repository'
import { InMemoryVerificationTokensRepository } from '@test/repositories/in-memory-verification-tokens-repository'

import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { DomainEvents } from '@/core/events/domain-events'

import { EmailUpdateVerificationRequestedEvent } from '../../enterprise/events/email-update-verification-requested-event'
import { RefineProfileUseCase } from './refine-profile'

let inMemoryUsersRepository: InMemoryUsersRepository
let inMemoryVerificationTokensRepository: InMemoryVerificationTokensRepository
let sut: RefineProfileUseCase

describe('Refine Profile Use-case', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    inMemoryVerificationTokensRepository =
      new InMemoryVerificationTokensRepository()
    sut = new RefineProfileUseCase(
      inMemoryUsersRepository,
      inMemoryVerificationTokensRepository,
    )
  })

  it('should be able to update a valid user', async () => {
    const user = await makeUser({
      name: 'Test Name',
      email: 'example@email.com',
      password: '123456',
    })
    inMemoryUsersRepository.items.push(user)

    const emailUpdateVerificationRequestedEventSpy = jest.fn()
    DomainEvents.register(
      emailUpdateVerificationRequestedEventSpy,
      EmailUpdateVerificationRequestedEvent.name,
    )

    const response = await sut.execute({
      userId: user.id.toString(),
      name: 'Updated Name',
      email: 'updated@email.com',
      newPassword: '654321',
    })

    expect(response.isRight()).toBeTruthy()
    expect(inMemoryUsersRepository.items[0]).toEqual(
      expect.objectContaining({
        name: 'Updated Name',
        email: 'updated@email.com',
      }),
    )
    expect(
      await inMemoryUsersRepository.items[0].verifyPassword('654321'),
    ).toBeTruthy()
    expect(inMemoryVerificationTokensRepository.items.size).toEqual(1)

    expect(emailUpdateVerificationRequestedEventSpy).toHaveBeenCalled()
  })

  it('should be able to update a user without change the password', async () => {
    const user = await makeUser({
      name: 'Test Name',
      email: 'example@email.com',
      password: '123456',
    })
    inMemoryUsersRepository.items.push(user)

    const response = await sut.execute({
      userId: user.id.toString(),
      name: 'Updated Name',
      email: 'updated@email.com',
    })

    expect(response.isRight()).toBeTruthy()
    expect(inMemoryUsersRepository.items[0]).toEqual(
      expect.objectContaining({
        name: 'Updated Name',
        email: 'updated@email.com',
      }),
    )
    expect(
      await inMemoryUsersRepository.items[0].verifyPassword('123456'),
    ).toBeTruthy()
  })

  it('should not be able to update an invalid user', async () => {
    const response = await sut.execute({
      userId: 'user-1',
      name: 'Updated Name',
      email: 'updated@email.com',
    })

    expect(response.isLeft()).toBeTruthy()
    expect(response.value).toHaveProperty('message', 'Usuário não encontrado.')
  })

  it('should not be able to update a user with an email that is already in use', async () => {
    const user1 = await makeUser(
      {
        email: 'user1@email.com',
      },
      new UniqueEntityID('user-1'),
    )
    const user2 = await makeUser(
      {
        email: 'user2@email.com',
      },
      new UniqueEntityID('user-2'),
    )
    inMemoryUsersRepository.items.push(user1)
    inMemoryUsersRepository.items.push(user2)

    const response = await sut.execute({
      userId: 'user-1',
      name: 'Updated Name',
      email: 'user2@email.com',
    })

    expect(response.isLeft()).toBeTruthy()
    expect(response.value).toHaveProperty(
      'message',
      'Este e-mail já está em uso.',
    )
    expect(inMemoryUsersRepository.items[0].email).toEqual('user1@email.com')
  })
})
