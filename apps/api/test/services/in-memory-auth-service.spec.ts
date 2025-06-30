import { InMemoryAuthService } from './in-memory-auth-service'

let inMemoryAuthService: InMemoryAuthService

describe('In Memory Auth Service', () => {
  beforeEach(() => {
    inMemoryAuthService = new InMemoryAuthService()
  })

  it('should invalidate access token after expiration', async () => {
    const userId = 'user-123'
    const token = inMemoryAuthService.generateAccessToken(userId, '1s')
    const response = inMemoryAuthService.verifyToken(token, 'access')
    expect(response.isRight()).toBe(true)

    await new Promise((resolve) => setTimeout(resolve, 1000))
    const expiredResponse = inMemoryAuthService.verifyToken(token, 'access')
    expect(expiredResponse.isLeft()).toBeTruthy()
    expect(expiredResponse.value).toHaveProperty('message', 'Token inválido.')
  })

  it('should invalidate refresh token after expiration', async () => {
    const userId = 'user-123'
    const token = inMemoryAuthService.generateRefreshToken(userId, '1s')
    const response = inMemoryAuthService.verifyToken(token, 'refresh')
    expect(response.isRight()).toBe(true)

    await new Promise((resolve) => setTimeout(resolve, 1000))
    const expiredResponse = inMemoryAuthService.verifyToken(token, 'refresh')
    expect(expiredResponse.isLeft()).toBeTruthy()
    expect(expiredResponse.value).toHaveProperty('message', 'Token inválido.')
  })
})
