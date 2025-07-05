import { DomainEvents } from '@/core/events/domain-events'
import type { VerificationTokensRepository } from '@/domain/auth/application/repositories/verification-tokens-repository'
import type {
  TokenType,
  VerificationToken,
} from '@/domain/auth/enterprise/entities/verification-token'

export class InMemoryVerificationTokensRepository
  implements VerificationTokensRepository
{
  public items: Map<string, { value: VerificationToken; expiresAt: number }> =
    new Map()

  private buildKey(type: TokenType, token: string) {
    return `${type}:${token}`
  }

  async save(verificationToken: VerificationToken): Promise<void> {
    const key = this.buildKey(verificationToken.type, verificationToken.token)

    this.items.set(key, {
      value: verificationToken,
      expiresAt: verificationToken.expiresAt.getTime(),
    })

    DomainEvents.dispatchEventsForAggregate(verificationToken.id)
  }

  async get(token: string, type: TokenType): Promise<VerificationToken | null> {
    const key = this.buildKey(type, token)
    const item = this.items.get(key)

    if (!item || item.expiresAt < Date.now()) {
      this.items.delete(key)
      return null
    }

    return item.value
  }

  async delete({ type, token }: VerificationToken): Promise<void> {
    const key = this.buildKey(type, token)
    this.items.delete(key)
  }

  async revokeTokensByUserId(userId: string): Promise<void> {
    for (const [key, item] of this.items.entries()) {
      if (item.value.userId.toString() === userId) {
        this.items.delete(key)
      }
    }
  }
}
