import { randomUUID } from 'node:crypto'

import { InMemoryTokenService } from './in-memory-token-service'

let inMemoryTokenService: InMemoryTokenService

describe('In Memory Token Service', () => {
  beforeEach(() => {
    inMemoryTokenService = new InMemoryTokenService()
  })

  it('should be able to save a token', () => {
    const key = 'test:test-1'
    const token = randomUUID()

    const ttlSeconds = 10

    const value = JSON.stringify({
      id: 'test-1',
      token,
      expiresAt: new Date(Date.now() + ttlSeconds * 1000).toISOString(),
    })

    inMemoryTokenService.save(key, value, ttlSeconds)

    expect(inMemoryTokenService.items.size).toEqual(1)

    const valueData = JSON.parse(
      inMemoryTokenService.items.get(key)?.value ?? '',
    )
    expect(valueData.id).toEqual('test-1')
  })

  it('should be able to get a saved token', async () => {
    const key = 'test:test-1'
    const token = randomUUID()

    const ttlSeconds = 10

    const value = JSON.stringify({
      id: 'test-1',
      token,
      expiresAt: new Date(Date.now() + ttlSeconds * 1000).toISOString(),
    })

    inMemoryTokenService.save(key, value, ttlSeconds)

    const data = await inMemoryTokenService.get(key)
    expect(data).not.toBeNull()
    const valueData = JSON.parse(data ?? '')
    expect(valueData.id).toEqual('test-1')
  })

  it('should be able to delete a saved token', async () => {
    const key = 'test:test-1'
    const token = randomUUID()

    const ttlSeconds = 10

    const value = JSON.stringify({
      id: 'test-1',
      token,
      expiresAt: new Date(Date.now() + ttlSeconds * 1000).toISOString(),
    })

    inMemoryTokenService.save(key, value, ttlSeconds)
    inMemoryTokenService.delete(key)

    expect(inMemoryTokenService.items.size).toEqual(0)
  })

  it("should be able to revoke all user's token", async () => {
    const key1 = 'test:test-1'
    const key2 = 'test:test-2'
    const ttlSeconds = 10

    const value = JSON.stringify({
      userId: 'user-id',
      expiresAt: new Date(Date.now() + ttlSeconds * 1000).toISOString(),
    })

    inMemoryTokenService.save(key1, value, ttlSeconds)
    inMemoryTokenService.save(key2, value, ttlSeconds)

    inMemoryTokenService.revokeTokensByUserId('user-id')

    expect(inMemoryTokenService.items.size).toEqual(0)
  })

  it('should be able to delete a expired token automatically', async () => {
    const key = 'test:test-1'
    const token = randomUUID()

    const ttlSeconds = -1 // past

    const value = JSON.stringify({
      id: 'test-1',
      token,
      expiresAt: new Date(Date.now() + ttlSeconds * 1000).toISOString(),
    })

    inMemoryTokenService.save(key, value, ttlSeconds)

    inMemoryTokenService.get(key)

    expect(inMemoryTokenService.items.size).toEqual(0)
  })
})
