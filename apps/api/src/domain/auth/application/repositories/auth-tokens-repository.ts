import type { AuthToken } from '../../enterprise/entities/auth-token'

export interface AuthTokensRepository {
  create(authToken: AuthToken): Promise<void>
  findByRefreshToken(refreshToken: string): Promise<AuthToken | null>
}
