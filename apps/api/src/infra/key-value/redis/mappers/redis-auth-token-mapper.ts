import type { AuthToken } from '@/domain/auth/enterprise/entities/auth-token'

export class RedisAuthTokenMapper {
  static toDomain(raw: string): AuthToken {
    return JSON.parse(raw)
  }

  static toRedis(raw: AuthToken): string {
    return JSON.stringify(raw)
  }
}
