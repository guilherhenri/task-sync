import { Injectable } from '@nestjs/common'

import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import {
  VerificationToken,
  type VerificationTokenProps,
} from '@/domain/auth/enterprise/entities/verification-token'
import { RedisVerificationTokenMapper } from '@/infra/key-value/redis/mappers/redis-verification-token-mapper'
import { RedisService } from '@/infra/key-value/redis/redis.service'

export function makeVerificationToken(
  override: Partial<Omit<VerificationTokenProps, 'token' | 'tokenHash'>> = {},
  id?: UniqueEntityID,
) {
  const verificationToken = VerificationToken.create(
    {
      userId: new UniqueEntityID(),
      type: 'email:verify',
      ...override,
    },
    id,
  )

  return verificationToken
}

@Injectable()
export class VerificationTokenFactory {
  private expiresIn: number = 24 * 60 * 60 // 24 hours

  constructor(private readonly redis: RedisService) {}

  async makeRedisVerificationToken(
    data: Partial<VerificationTokenProps>,
  ): Promise<VerificationToken> {
    const verificationToken = makeVerificationToken(data)

    const key = `${verificationToken.userId.toString()}:${verificationToken.type}:${verificationToken.token}`
    const value = RedisVerificationTokenMapper.toRedis(verificationToken)

    await this.redis.set(key, value, 'EX', this.expiresIn)

    return verificationToken
  }
}
