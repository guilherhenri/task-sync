import type { AuthTokensRepository } from '@/domain/auth/application/repositories/auth-tokens-repository'
import type { AuthToken } from '@/domain/auth/enterprise/entities/auth-token'

export class InMemoryAuthTokensRepository implements AuthTokensRepository {
  public items: Array<AuthToken> = []

  async findByUserId(userId: string): Promise<AuthToken | null> {
    return this.items.find((item) => item.userId.toString() === userId) ?? null
  }

  async create(authToken: AuthToken): Promise<void> {
    this.items.push(authToken)
  }

  async delete(authToken: AuthToken): Promise<void> {
    const authTokenIndex = this.items.findIndex(
      (item) => item.id === authToken.id,
    )

    this.items.splice(authTokenIndex, 1)
  }

  async revokeTokensByUserId(userId: string): Promise<void> {
    this.items = this.items.filter(
      (token) => token.userId.toString() !== userId,
    )
  }
}
