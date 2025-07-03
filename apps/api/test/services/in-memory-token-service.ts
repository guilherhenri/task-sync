import type { TokenService } from '@/domain/auth/application/services/token-service'

export class InMemoryTokenService implements TokenService {
  public items: Map<string, { value: string; expiresAt: number }> = new Map()

  async save(key: string, value: string, ttlSeconds: number): Promise<void> {
    const expiresAt = Date.now() + ttlSeconds * 1000
    this.items.set(key, { value, expiresAt })
  }

  async get(key: string): Promise<string | null> {
    const item = this.items.get(key)

    if (!item || item.expiresAt < Date.now()) {
      this.items.delete(key)
      return null
    }

    return item.value
  }

  async delete(key: string): Promise<void> {
    this.items.delete(key)
  }

  async revokeTokensByUserId(userId: string): Promise<void> {
    const pattern = new RegExp(`"userId"\\s*:\\s*"${userId}"`)

    for (const [key, item] of this.items.entries()) {
      if (pattern.test(item.value)) {
        this.items.delete(key)
      }
    }
  }
}
