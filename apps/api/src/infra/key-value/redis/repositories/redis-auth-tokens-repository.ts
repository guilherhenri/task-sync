import { Injectable } from '@nestjs/common'

import type { AuthTokensRepository } from '@/domain/auth/application/repositories/auth-tokens-repository'
import type { AuthToken } from '@/domain/auth/enterprise/entities/auth-token'

import { RedisAuthTokenMapper } from '../mappers/redis-auth-token-mapper'
import { RedisService } from '../redis.service'

@Injectable()
export class RedisAuthTokensRepository implements AuthTokensRepository {
  private expiresIn: number = 7 * 24 * 60 * 60 // 7 days

  constructor(private readonly redis: RedisService) {}

  private buildKey(userId: string): string {
    return `refresh:${userId}:userId`
  }

  async findByUserId(userId: string): Promise<AuthToken | null> {
    const key = this.buildKey(userId)

    const value = await this.redis.get(key)

    if (!value) return null

    return RedisAuthTokenMapper.toDomain(value)
  }

  async create(authToken: AuthToken): Promise<void> {
    const key = this.buildKey(authToken.userId.toString())
    const value = RedisAuthTokenMapper.toRedis(authToken)

    await this.redis.set(key, value, 'EX', this.expiresIn)
  }

  async delete({ userId }: AuthToken): Promise<void> {
    const key = this.buildKey(userId.toString())

    await this.redis.del(key)
  }

  async revokeTokensByUserId(userId: string): Promise<void> {
    const pattern = `refresh:${userId}:*`
    const userKeys = []
    let cursor = '0'

    do {
      const [nextCursor, keys] = await this.redis.scan(
        cursor,
        'MATCH',
        pattern,
        'COUNT',
        100,
      )
      cursor = nextCursor
      userKeys.push(...keys)
    } while (cursor !== '0')

    if (userKeys.length > 0) {
      await this.redis.del(userKeys)
    }
  }
}
