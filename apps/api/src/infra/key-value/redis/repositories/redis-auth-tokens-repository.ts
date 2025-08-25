import { Injectable } from '@nestjs/common'

import type { AuthTokensRepository } from '@/domain/auth/application/repositories/auth-tokens-repository'
import type { AuthToken } from '@/domain/auth/enterprise/entities/auth-token'
import { WinstonService } from '@/infra/logging/winston.service'

import { RedisAuthTokenMapper } from '../mappers/redis-auth-token-mapper'
import { RedisService } from '../redis.service'

@Injectable()
export class RedisAuthTokensRepository implements AuthTokensRepository {
  private expiresIn: number = 7 * 24 * 60 * 60 // 7 days

  constructor(
    private readonly redis: RedisService,
    private readonly winston: WinstonService,
  ) {}

  private buildKey(userId: string): string {
    return `refresh:${userId}:userId`
  }

  async findByUserId(userId: string): Promise<AuthToken | null> {
    const startTime = Date.now()
    const key = this.buildKey(userId)

    try {
      const value = await this.redis.get(key)

      this.winston.logDatabaseQuery({
        query: 'GET auth token by user id',
        duration: Date.now() - startTime,
        success: true,
        table: 'auth_tokens',
        operation: 'GET',
      })

      if (!value) return null

      return RedisAuthTokenMapper.toDomain(value)
    } catch (error) {
      this.winston.logDatabaseQuery({
        query: 'GET auth token by user id',
        duration: Date.now() - startTime,
        success: false,
        table: 'auth_tokens',
        operation: 'GET',
        error: (error as Error).message,
      })

      throw error
    }
  }

  async create(authToken: AuthToken): Promise<void> {
    const startTime = Date.now()
    const key = this.buildKey(authToken.userId.toString())
    const value = RedisAuthTokenMapper.toRedis(authToken)

    try {
      await this.redis.set(key, value, 'EX', this.expiresIn)

      this.winston.logDatabaseQuery({
        query: 'SET auth token',
        duration: Date.now() - startTime,
        success: true,
        table: 'auth_tokens',
        operation: 'SET',
      })
    } catch (error) {
      this.winston.logDatabaseQuery({
        query: 'SET auth token',
        duration: Date.now() - startTime,
        success: false,
        table: 'auth_tokens',
        operation: 'SET',
        error: (error as Error).message,
      })

      throw error
    }
  }

  async delete({ userId }: AuthToken): Promise<void> {
    const startTime = Date.now()
    const key = this.buildKey(userId.toString())

    try {
      await this.redis.del(key)

      this.winston.logDatabaseQuery({
        query: 'DELETE auth token',
        duration: Date.now() - startTime,
        success: true,
        table: 'auth_tokens',
        operation: 'DELETE',
      })
    } catch (error) {
      this.winston.logDatabaseQuery({
        query: 'DELETE auth token',
        duration: Date.now() - startTime,
        success: false,
        table: 'auth_tokens',
        operation: 'DELETE',
        error: (error as Error).message,
      })

      throw error
    }
  }

  async revokeTokensByUserId(userId: string): Promise<void> {
    const startTime = Date.now()
    const pattern = `refresh:${userId}:*`
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
        query: 'DELETE auth tokens by user id',
        duration: Date.now() - startTime,
        success: true,
        table: 'auth_tokens',
        operation: 'DELETE',
      })
    } catch (error) {
      this.winston.logDatabaseQuery({
        query: 'DELETE auth tokens by user id',
        duration: Date.now() - startTime,
        success: false,
        table: 'auth_tokens',
        operation: 'DELETE',
        error: (error as Error).message,
      })

      throw error
    }
  }
}
