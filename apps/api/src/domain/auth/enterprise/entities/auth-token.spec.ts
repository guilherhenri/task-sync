import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { AuthToken } from './auth-token'

it('should be able to create a auth token', () => {
  const authToken = AuthToken.create({
    userId: new UniqueEntityID('user-id'),
    refreshToken: 'refreshToken',
    expiresAt: new Date(Date.now() + 60 * 1000),
  })

  expect(authToken.id).toBeInstanceOf(UniqueEntityID)
  expect(authToken.userId.toString()).toEqual('user-id')
  expect(authToken.refreshToken).toEqual('refreshToken')
  expect(authToken.expiresAt).toBeInstanceOf(Date)
  expect(authToken.createdAt).toBeInstanceOf(Date)

  expect(authToken.isExpired()).toBeFalsy()
})
