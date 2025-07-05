import { UniqueEntityID } from '@/core/entities/unique-entity-id'

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
