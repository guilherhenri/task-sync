import { Injectable } from '@nestjs/common'
import { FakeEncryptor } from '@test/cryptography/fake-encryptor'

import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import {
  AuthToken,
  type AuthTokenProps,
} from '@/domain/auth/enterprise/entities/auth-token'
import { RedisAuthTokenMapper } from '@/infra/key-value/redis/mappers/redis-auth-token-mapper'
import { RedisService } from '@/infra/key-value/redis/redis.service'

export async function makeAuthToken(
  override: Partial<AuthTokenProps> = {},
  id?: UniqueEntityID,
) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 dias
  const userId = override.userId ?? new UniqueEntityID()
  const refreshToken =
    override.refreshToken ??
    (await new FakeEncryptor().encrypt({
      sub: userId.toString(),
    }))

  const authToken = AuthToken.create(
    {
      userId,
      refreshToken,
      expiresAt,
      ...override,
    },
    id,
  )

  return authToken
}

@Injectable()
export class AuthTokenFactory {
  private expiresIn: number = 7 * 24 * 60 * 60 // 7 days

  constructor(private readonly redis: RedisService) {}

  async makeRedisAuthToken(data: Partial<AuthTokenProps>): Promise<AuthToken> {
    const authToken = await makeAuthToken(data)

    const key = `refresh:${authToken.userId.toString()}:userId`
    const value = RedisAuthTokenMapper.toRedis(authToken)

    await this.redis.set(key, value, 'EX', this.expiresIn)

    return authToken
  }
}
