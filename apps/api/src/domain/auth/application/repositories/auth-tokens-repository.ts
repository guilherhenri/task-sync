import type { AuthToken } from '../../enterprise/entities/auth-token'

export interface AuthTokensRepository {
  findByRefreshToken(refreshToken: string): Promise<AuthToken | null>

  create(authToken: AuthToken): Promise<void>
  delete(authToken: AuthToken): Promise<void>
}
