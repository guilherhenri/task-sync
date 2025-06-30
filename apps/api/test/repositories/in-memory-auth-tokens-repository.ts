import type { AuthTokensRepository } from '@/domain/auth/application/repositories/auth-tokens-repository'
import type { AuthToken } from '@/domain/auth/enterprise/entities/auth-token'

export class InMemoryAuthTokensRepository implements AuthTokensRepository {
  public items: Array<AuthToken> = []

  async findByRefreshToken(refreshToken: string): Promise<AuthToken | null> {
    return this.items.find((item) => item.refreshToken === refreshToken) ?? null
  }

  async create(authToken: AuthToken): Promise<void> {
    this.items.push(authToken)
  }
}
