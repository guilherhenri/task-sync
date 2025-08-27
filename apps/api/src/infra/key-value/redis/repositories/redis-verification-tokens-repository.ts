import { Injectable } from '@nestjs/common'

import { DomainEvents } from '@/core/events/domain-events'
import type { VerificationTokensRepository } from '@/domain/auth/application/repositories/verification-tokens-repository'
import {
  TokenType,
  VerificationToken,
} from '@/domain/auth/enterprise/entities/verification-token'
import { WinstonService } from '@/infra/logging/winston.service'
import { MetricsService } from '@/infra/metrics/metrics.service'

import { RedisVerificationTokenMapper } from '../mappers/redis-verification-token-mapper'
import { RedisService } from '../redis.service'

@Injectable()
export class RedisVerificationTokensRepository
  implements VerificationTokensRepository
{
  private expiresIn: number = 24 * 60 * 60 // 24 hours

  constructor(
    private readonly redis: RedisService,
    private readonly winston: WinstonService,
    private readonly metrics: MetricsService,
  ) {}

  private buildKey({ userId, type, token }: VerificationToken) {
    return `${userId.toString()}:${type}:${token}`
  }

  async save(verificationToken: VerificationToken): Promise<void> {
    const startTime = Date.now()
    const key = this.buildKey(verificationToken)
    const value = RedisVerificationTokenMapper.toRedis(verificationToken)

    try {
      await this.redis.set(key, value, 'EX', this.expiresIn)

      this.winston.logDatabaseQuery({
        query: 'SET verification token',
        duration: Date.now() - startTime,
        success: true,
        table: 'verification_tokens',
        operation: 'SET',
      })
      this.metrics.recordDbMetrics(
        'SET',
        'verification_tokens',
        Date.now() - startTime,
        true,
      )

      DomainEvents.dispatchEventsForAggregate(verificationToken.id)
    } catch (error) {
      this.winston.logDatabaseQuery({
        query: 'SET verification token',
        duration: Date.now() - startTime,
        success: false,
        table: 'verification_tokens',
        operation: 'SET',
        error: (error as Error).message,
      })
      this.metrics.recordDbMetrics(
        'SET',
        'verification_tokens',
        Date.now() - startTime,
        false,
      )

      throw error
    }
  }

  async get(token: string, type: TokenType): Promise<VerificationToken | null> {
    const startTime = Date.now()
    const pattern = `*:${type}:${token}`

    try {
      const keys = await this.redis.keys(pattern)

      this.winston.logDatabaseQuery({
        query: 'KEYS verification token',
        duration: Date.now() - startTime,
        success: true,
        table: 'verification_tokens',
        operation: 'KEYS',
      })
      this.metrics.recordDbMetrics(
        'KEYS',
        'verification_tokens',
        Date.now() - startTime,
        true,
      )

      if (keys.length === 0) return null

      const value = await this.redis.get(keys[0])

      this.winston.logDatabaseQuery({
        query: 'GET verification token',
        duration: Date.now() - startTime,
        success: true,
        table: 'verification_tokens',
        operation: 'GET',
      })
      this.metrics.recordDbMetrics(
        'GET',
        'verification_tokens',
        Date.now() - startTime,
        true,
      )

      if (!value) return null

      return RedisVerificationTokenMapper.toDomain(value)
    } catch (error) {
      this.winston.logDatabaseQuery({
        query: 'GET verification token',
        duration: Date.now() - startTime,
        success: false,
        table: 'verification_tokens',
        operation: 'GET',
        error: (error as Error).message,
      })
      this.metrics.recordDbMetrics(
        'GET',
        'verification_tokens',
        Date.now() - startTime,
        false,
      )

      throw error
    }
  }

  async delete(verificationToken: VerificationToken): Promise<void> {
    const startTime = Date.now()
    const key = this.buildKey(verificationToken)

    try {
      await this.redis.del(key)

      this.winston.logDatabaseQuery({
        query: 'DELETE verification token',
        duration: Date.now() - startTime,
        success: true,
        table: 'verification_tokens',
        operation: 'DELETE',
      })
      this.metrics.recordDbMetrics(
        'DELETE',
        'verification_tokens',
        Date.now() - startTime,
        true,
      )
    } catch (error) {
      this.winston.logDatabaseQuery({
        query: 'DELETE verification token',
        duration: Date.now() - startTime,
        success: false,
        table: 'verification_tokens',
        operation: 'DELETE',
        error: (error as Error).message,
      })
      this.metrics.recordDbMetrics(
        'DELETE',
        'verification_tokens',
        Date.now() - startTime,
        false,
      )

      throw error
    }
  }

  async revokeTokensByUserId(userId: string): Promise<void> {
    const startTime = Date.now()
    const pattern = `${userId}:*`
    const userKeys = []
    let cursor = '0'

    try {
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

      this.winston.logDatabaseQuery({
        query: 'DELETE verification tokens by user id',
        duration: Date.now() - startTime,
        success: true,
        table: 'verification_tokens',
        operation: 'DELETE',
      })
      this.metrics.recordDbMetrics(
        'DELETE',
        'verification_tokens',
        Date.now() - startTime,
        true,
      )
    } catch (error) {
      this.winston.logDatabaseQuery({
        query: 'DELETE verification tokens by user id',
        duration: Date.now() - startTime,
        success: false,
        table: 'verification_tokens',
        operation: 'DELETE',
        error: (error as Error).message,
      })
      this.metrics.recordDbMetrics(
        'DELETE',
        'verification_tokens',
        Date.now() - startTime,
        false,
      )

      throw error
    }
  }
}
