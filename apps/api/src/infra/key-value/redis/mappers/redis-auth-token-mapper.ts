import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { AuthToken } from '@/domain/auth/enterprise/entities/auth-token'

interface RedisAuthToken {
  id: string
  userId: string
  refreshToken: string
  expiresAt: Date
  createdAt: Date
}

export class RedisAuthTokenMapper {
  static toDomain(raw: string): AuthToken {
    const parsed: RedisAuthToken = JSON.parse(raw)

    return AuthToken.create(
      {
        userId: new UniqueEntityID(parsed.userId),
        refreshToken: parsed.refreshToken,
        expiresAt: parsed.expiresAt,
        createdAt: parsed.createdAt,
      },
      new UniqueEntityID(parsed.id),
    )
  }

  static toRedis(raw: AuthToken): string {
    const toParse: RedisAuthToken = {
      id: raw.id.toString(),
      userId: raw.userId.toString(),
      refreshToken: raw.refreshToken,
      expiresAt: raw.expiresAt,
      createdAt: raw.createdAt,
    }

    return JSON.stringify(toParse)
  }
}
