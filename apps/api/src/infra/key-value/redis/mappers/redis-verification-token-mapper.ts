import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import {
  type TokenType,
  VerificationToken,
} from '@/domain/auth/enterprise/entities/verification-token'

interface RedisVerificationToken {
  id: string
  userId: string
  token: string
  tokenHash: string
  type: TokenType
  expiresAt: Date
}

export class RedisVerificationTokenMapper {
  static toDomain(raw: string): VerificationToken {
    const parsed: RedisVerificationToken = JSON.parse(raw)

    return VerificationToken.create(
      {
        userId: new UniqueEntityID(parsed.userId),
        type: parsed.type,
        token: parsed.token,
        tokenHash: parsed.tokenHash,
        expiresAt: parsed.expiresAt,
      },
      new UniqueEntityID(parsed.id),
    )
  }

  static toRedis(raw: VerificationToken): string {
    const serializable: RedisVerificationToken = {
      id: raw.id.toString(),
      userId: raw.userId.toString(),
      type: raw.type,
      token: raw.token,
      tokenHash: raw.tokenHash,
      expiresAt: raw.expiresAt,
    }

    return JSON.stringify(serializable)
  }
}
