import { Injectable } from '@nestjs/common'

import { DomainEvents } from '@/core/events/domain-events'
import type { VerificationTokensRepository } from '@/domain/auth/application/repositories/verification-tokens-repository'
import {
  TokenType,
  VerificationToken,
} from '@/domain/auth/enterprise/entities/verification-token'

import { RedisVerificationTokenMapper } from '../mappers/redis-verification-token-mapper'
import { RedisService } from '../redis.service'

@Injectable()
export class RedisVerificationTokensRepository
  implements VerificationTokensRepository
{
  private expiresIn: number = 24 * 60 * 60 // 24 hours

  constructor(private readonly redis: RedisService) {}

  private buildKey({ userId, type, token }: VerificationToken) {
    return `${userId.toString()}:${type}:${token}`
  }

  async save(verificationToken: VerificationToken): Promise<void> {
    const key = this.buildKey(verificationToken)
    const value = RedisVerificationTokenMapper.toRedis(verificationToken)

    await this.redis.set(key, value, 'EX', this.expiresIn)

    DomainEvents.dispatchEventsForAggregate(verificationToken.id)
  }

  async get(token: string, type: TokenType): Promise<VerificationToken | null> {
    const pattern = `*:${type}:${token}`

    const keys = await this.redis.keys(pattern)

    if (keys.length === 0) return null

    const value = await this.redis.get(keys[0])

    if (!value) return null

    return RedisVerificationTokenMapper.toDomain(value)
  }

  async delete(verificationToken: VerificationToken): Promise<void> {
    const key = this.buildKey(verificationToken)

    await this.redis.del(key)
  }

  async revokeTokensByUserId(userId: string): Promise<void> {
    const pattern = `${userId}:*`
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

    await this.redis.del(userKeys)
  }
}
