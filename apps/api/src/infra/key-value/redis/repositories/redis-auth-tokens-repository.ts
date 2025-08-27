import { Injectable } from '@nestjs/common'

import type { AuthTokensRepository } from '@/domain/auth/application/repositories/auth-tokens-repository'
import type { AuthToken } from '@/domain/auth/enterprise/entities/auth-token'
import { ObservableRepository } from '@/infra/observability/observable-repository'

import { RedisAuthTokenMapper } from '../mappers/redis-auth-token-mapper'
import { RedisService } from '../redis.service'

@Injectable()
export class RedisAuthTokensRepository
  extends ObservableRepository
  implements AuthTokensRepository
{
  private expiresIn: number = 7 * 24 * 60 * 60 // 7 days

  constructor(private readonly redis: RedisService) {
    super()
  }

  private buildKey(userId: string): string {
    return `refresh:${userId}:userId`
  }

  async findByUserId(userId: string): Promise<AuthToken | null> {
    return this.trackOperation(
      async () => {
        const key = this.buildKey(userId)

        const value = await this.redis.get(key)

        if (!value) return null

        return RedisAuthTokenMapper.toDomain(value)
      },
      {
        query: 'GET auth tokens by user id',
        operation: 'GET',
        table: 'auth_tokens',
      },
    )

    // try {

    //   this.winston.logDatabaseQuery({
    //     query: 'GET auth_tokens by user id',
    //     duration: Date.now() - startTime,
    //     success: true,
    //     table: 'auth_tokens',
    //     operation: 'GET',
    //   })
    //   this.metrics.recordDbMetrics(
    //     'GET',
    //     'auth_tokens',
    //     Date.now() - startTime,
    //     true,
    //   )

    // } catch (error) {
    //   this.winston.logDatabaseQuery({
    //     query: 'GET auth_tokens by user id',
    //     duration: Date.now() - startTime,
    //     success: false,
    //     table: 'auth_tokens',
    //     operation: 'GET',
    //     error: (error as Error).message,
    //   })
    //   this.metrics.recordDbMetrics(
    //     'GET',
    //     'auth_tokens',
    //     Date.now() - startTime,
    //     false,
    //   )

    //   throw error
    // }
  }

  async create(authToken: AuthToken): Promise<void> {
    await this.trackOperation(
      async () => {
        const key = this.buildKey(authToken.userId.toString())
        const value = RedisAuthTokenMapper.toRedis(authToken)

        await this.redis.set(key, value, 'EX', this.expiresIn)
      },
      { query: 'SET auth tokens', operation: 'SET', table: 'auth_tokens' },
    )

    // try {

    //   this.winston.logDatabaseQuery({
    //     query: 'SET auth_tokens',
    //     duration: Date.now() - startTime,
    //     success: true,
    //     table: 'auth_tokens',
    //     operation: 'SET',
    //   })
    //   this.metrics.recordDbMetrics(
    //     'SET',
    //     'auth_tokens',
    //     Date.now() - startTime,
    //     true,
    //   )
    // } catch (error) {
    //   this.winston.logDatabaseQuery({
    //     query: 'SET auth_tokens',
    //     duration: Date.now() - startTime,
    //     success: false,
    //     table: 'auth_tokens',
    //     operation: 'SET',
    //     error: (error as Error).message,
    //   })
    //   this.metrics.recordDbMetrics(
    //     'SET',
    //     'auth_tokens',
    //     Date.now() - startTime,
    //     false,
    //   )

    //   throw error
    // }
  }

  async delete({ userId }: AuthToken): Promise<void> {
    await this.trackOperation(
      async () => {
        const key = this.buildKey(userId.toString())

        await this.redis.del(key)
      },
      {
        query: 'DELETE auth tokens',
        operation: 'DELETE',
        table: 'auth_tokens',
      },
    )

    // try {

    //   this.winston.logDatabaseQuery({
    //     query: 'DELETE auth_tokens',
    //     duration: Date.now() - startTime,
    //     success: true,
    //     table: 'auth_tokens',
    //     operation: 'DELETE',
    //   })
    //   this.metrics.recordDbMetrics(
    //     'DELETE',
    //     'auth_tokens',
    //     Date.now() - startTime,
    //     true,
    //   )
    // } catch (error) {
    //   this.winston.logDatabaseQuery({
    //     query: 'DELETE auth_tokens',
    //     duration: Date.now() - startTime,
    //     success: false,
    //     table: 'auth_tokens',
    //     operation: 'DELETE',
    //     error: (error as Error).message,
    //   })
    //   this.metrics.recordDbMetrics(
    //     'DELETE',
    //     'auth_tokens',
    //     Date.now() - startTime,
    //     false,
    //   )

    //   throw error
    // }
  }

  async revokeTokensByUserId(userId: string): Promise<void> {
    await this.trackOperation(
      async () => {
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
      },
      {
        query: 'DELETE auth tokens by user id',
        operation: 'DELETE',
        table: 'auth_tokens',
      },
    )

    // try {

    //   this.winston.logDatabaseQuery({
    //     query: 'DELETE auth tokens by user id',
    //     duration: Date.now() - startTime,
    //     success: true,
    //     table: 'auth_tokens',
    //     operation: 'DELETE',
    //   })
    //   this.metrics.recordDbMetrics(
    //     'DELETE',
    //     'auth_tokens',
    //     Date.now() - startTime,
    //     true,
    //   )
    // } catch (error) {
    //   this.winston.logDatabaseQuery({
    //     query: 'DELETE auth tokens by user id',
    //     duration: Date.now() - startTime,
    //     success: false,
    //     table: 'auth_tokens',
    //     operation: 'DELETE',
    //     error: (error as Error).message,
    //   })
    //   this.metrics.recordDbMetrics(
    //     'DELETE',
    //     'auth_tokens',
    //     Date.now() - startTime,
    //     false,
    //   )

    //   throw error
    // }
  }
}
