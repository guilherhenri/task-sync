import type { AuthToken } from '../../enterprise/entities/auth-token'

export abstract class AuthTokensRepository {
  abstract findByUserId(userId: string): Promise<AuthToken | null>
  abstract create(authToken: AuthToken): Promise<void>
  abstract delete(authToken: AuthToken): Promise<void>
  abstract revokeTokensByUserId(userId: string): Promise<void>
}
