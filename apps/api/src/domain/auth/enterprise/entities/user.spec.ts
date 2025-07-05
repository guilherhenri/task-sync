import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { PasswordResetEvent } from '../events/password-reset-event'
import { User } from './user'

it('should be able to create a user', async () => {
  const user = await User.create({
    name: 'User Test',
    email: 'example@email.com',
    password: '123456',
    avatarUrl: 'https://avatar-placeholder.com',
  })

  expect(user.id).toBeInstanceOf(UniqueEntityID)
  expect(user.name).toEqual('User Test')
  expect(user.email).toEqual('example@email.com')
  expect(user.passwordHash).not.toEqual('123456')
  expect(user.verifyPassword('123456')).toBeTruthy()
  expect(user.avatarUrl).toEqual('https://avatar-placeholder.com')
  expect(user.emailVerified).toBeFalsy()
  expect(user.createdAt.getTime()).toBeLessThan(Date.now())
  expect(user.updatedAt).toBeUndefined()
  expect(user.domainEvents).toHaveLength(1)

  user.verifyEmail()

  expect(user.emailVerified).toBeTruthy()
  expect(user.updatedAt).not.toBeUndefined()
})

it('should be able to reset a password', async () => {
  const user = await User.create({
    name: 'User Test',
    email: 'example@email.com',
    password: '123456',
    avatarUrl: 'https://avatar-placeholder.com',
  })

  await user.resetPassword('654321')

  expect(await user.verifyPassword('654321')).toBeTruthy()
  expect(user.domainEvents).toHaveLength(2)
  expect(user.domainEvents[1]).toBeInstanceOf(PasswordResetEvent)
})
