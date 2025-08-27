import { Injectable } from '@nestjs/common'

import { DomainEvents } from '@/core/events/domain-events'
import type { VerificationTokensRepository } from '@/domain/auth/application/repositories/verification-tokens-repository'
import {
  TokenType,
  VerificationToken,
} from '@/domain/auth/enterprise/entities/verification-token'
import { ObservableRepository } from '@/infra/observability/observable-repository'

import { RedisVerificationTokenMapper } from '../mappers/redis-verification-token-mapper'
import { RedisService } from '../redis.service'

@Injectable()
export class RedisVerificationTokensRepository
  extends ObservableRepository
  implements VerificationTokensRepository
{
  private expiresIn: number = 24 * 60 * 60 // 24 hours

  constructor(private readonly redis: RedisService) {
    super()
  }

  private buildKey({ userId, type, token }: VerificationToken) {
    return `${userId.toString()}:${type}:${token}`
  }

  async save(verificationToken: VerificationToken): Promise<void> {
    await this.trackOperation(
      async () => {
        const key = this.buildKey(verificationToken)
        const value = RedisVerificationTokenMapper.toRedis(verificationToken)

        await this.redis.set(key, value, 'EX', this.expiresIn)

        DomainEvents.dispatchEventsForAggregate(verificationToken.id)
      },
      {
        operation: 'SET',
        query: 'SET verification token',
        table: 'verification_tokens',
      },
    )

    // try {
    //   this.winston.logDatabaseQuery({
    //     query: 'SET verification token',
    //     duration: Date.now() - startTime,
    //     success: true,
    //     table: 'verification_tokens',
    //     operation: 'SET',
    //   })
    //   this.metrics.recordDbMetrics(
    //     'SET',
    //     'verification_tokens',
    //     Date.now() - startTime,
    //     true,
    //   )
    // } catch (error) {
    //   this.winston.logDatabaseQuery({
    //     query: 'SET verification token',
    //     duration: Date.now() - startTime,
    //     success: false,
    //     table: 'verification_tokens',
    //     operation: 'SET',
    //     error: (error as Error).message,
    //   })
    //   this.metrics.recordDbMetrics(
    //     'SET',
    //     'verification_tokens',
    //     Date.now() - startTime,
    //     false,
    //   )

    //   throw error
    // }
  }

  async get(token: string, type: TokenType): Promise<VerificationToken | null> {
    return this.trackOperation(
      async () => {
        const pattern = `*:${type}:${token}`

        const keys = await this.redis.keys(pattern)

        if (keys.length === 0) return null

        const value = await this.redis.get(keys[0])

        if (!value) return null

        return RedisVerificationTokenMapper.toDomain(value)
      },
      {
        query: 'KEYS verification token',
        operation: 'KEYS',
        table: 'verification_tokens',
      },
    )

    // try {
    //   this.winston.logDatabaseQuery({
    //     query: 'KEYS verification token',
    //     duration: Date.now() - startTime,
    //     success: true,
    //     table: 'verification_tokens',
    //     operation: 'KEYS',
    //   })
    //   this.metrics.recordDbMetrics(
    //     'KEYS',
    //     'verification_tokens',
    //     Date.now() - startTime,
    //     true,
    //   )

    //   this.winston.logDatabaseQuery({
    //     query: 'GET verification token',
    //     duration: Date.now() - startTime,
    //     success: true,
    //     table: 'verification_tokens',
    //     operation: 'GET',
    //   })
    //   this.metrics.recordDbMetrics(
    //     'GET',
    //     'verification_tokens',
    //     Date.now() - startTime,
    //     true,
    //   )
    // } catch (error) {
    //   this.winston.logDatabaseQuery({
    //     query: 'GET verification token',
    //     duration: Date.now() - startTime,
    //     success: false,
    //     table: 'verification_tokens',
    //     operation: 'GET',
    //     error: (error as Error).message,
    //   })
    //   this.metrics.recordDbMetrics(
    //     'GET',
    //     'verification_tokens',
    //     Date.now() - startTime,
    //     false,
    //   )

    //   throw error
    // }
  }

  async delete(verificationToken: VerificationToken): Promise<void> {
    await this.trackOperation(
      async () => {
        const key = this.buildKey(verificationToken)

        await this.redis.del(key)
      },
      {
        query: 'DELETE verification token',
        operation: 'DELETE',
        table: 'verification_tokens',
      },
    )

    // try {

    //   this.winston.logDatabaseQuery({
    //     query: 'DELETE verification token',
    //     duration: Date.now() - startTime,
    //     success: true,
    //     table: 'verification_tokens',
    //     operation: 'DELETE',
    //   })
    //   this.metrics.recordDbMetrics(
    //     'DELETE',
    //     'verification_tokens',
    //     Date.now() - startTime,
    //     true,
    //   )
    // } catch (error) {
    //   this.winston.logDatabaseQuery({
    //     query: 'DELETE verification token',
    //     duration: Date.now() - startTime,
    //     success: false,
    //     table: 'verification_tokens',
    //     operation: 'DELETE',
    //     error: (error as Error).message,
    //   })
    //   this.metrics.recordDbMetrics(
    //     'DELETE',
    //     'verification_tokens',
    //     Date.now() - startTime,
    //     false,
    //   )

    //   throw error
    // }
  }

  async revokeTokensByUserId(userId: string): Promise<void> {
    await this.trackOperation(
      async () => {
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

        if (userKeys.length > 0) {
          await this.redis.del(userKeys)
        }
      },
      {
        query: 'DELETE verification tokens by user id',
        operation: 'DELETE',
        table: 'verification_tokens',
      },
    )

    // try {

    //   this.winston.logDatabaseQuery({
    //     query: 'DELETE verification tokens by user id',
    //     duration: Date.now() - startTime,
    //     success: true,
    //     table: 'verification_tokens',
    //     operation: 'DELETE',
    //   })
    //   this.metrics.recordDbMetrics(
    //     'DELETE',
    //     'verification_tokens',
    //     Date.now() - startTime,
    //     true,
    //   )
    // } catch (error) {
    //   this.winston.logDatabaseQuery({
    //     query: 'DELETE verification tokens by user id',
    //     duration: Date.now() - startTime,
    //     success: false,
    //     table: 'verification_tokens',
    //     operation: 'DELETE',
    //     error: (error as Error).message,
    //   })
    //   this.metrics.recordDbMetrics(
    //     'DELETE',
    //     'verification_tokens',
    //     Date.now() - startTime,
    //     false,
    //   )

    //   throw error
    // }
  }
}
