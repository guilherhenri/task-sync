import { FakeHasher } from '@test/cryptography/fake-hasher'

import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { PasswordResetEvent } from '../events/password-reset-event'
import { User } from './user'

let fakeHasher: FakeHasher

describe('User Entity', () => {
  beforeEach(() => {
    fakeHasher = new FakeHasher()
  })

  it('should be able to create a user', async () => {
    const passwordHash = await fakeHasher.hash('123456')

    const user = User.create({
      name: 'User Test',
      email: 'example@email.com',
      passwordHash,
      avatarUrl: 'https://avatar-placeholder.com',
    })

    expect(user.id).toBeInstanceOf(UniqueEntityID)
    expect(user.name).toEqual('User Test')
    expect(user.email).toEqual('example@email.com')
    expect(user.passwordHash).not.toEqual('123456')
    expect(user.avatarUrl).toEqual('https://avatar-placeholder.com')
    expect(user.emailVerified).toBeFalsy()
    expect(user.updatedAt).toBeUndefined()
    expect(user.domainEvents).toHaveLength(1)

    user.verifyEmail()

    expect(user.emailVerified).toBeTruthy()
    expect(user.updatedAt).not.toBeUndefined()

    user.resetEmailVerification()
    expect(user.emailVerified).toBeFalsy()
  })

  it('should be able to reset a password', async () => {
    const passwordHash = await fakeHasher.hash('123456')

    const user = User.create({
      name: 'User Test',
      email: 'example@email.com',
      passwordHash,
      avatarUrl: 'https://avatar-placeholder.com',
    })

    const newPasswordHash = await fakeHasher.hash('654321')

    await user.resetPassword(newPasswordHash)

    expect(user.passwordHash).not.toEqual(passwordHash)
    expect(user.domainEvents).toHaveLength(2)
    expect(user.domainEvents[1]).toBeInstanceOf(PasswordResetEvent)
  })
})
