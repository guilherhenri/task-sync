import { Injectable } from '@nestjs/common'

import { WithObservability } from '@/core/decorators/observability.decorator'
import { type Either, right } from '@/core/either'
import { LoggerPort } from '@/core/ports/logger'
import { MetricsPort } from '@/core/ports/metrics'

import { AuthTokensRepository } from '../repositories/auth-tokens-repository'
import { VerificationTokensRepository } from '../repositories/verification-tokens-repository'

interface RevokeTokensUseCaseRequest {
  userId: string
}

type RevokeTokensUseCaseResponse = Either<void, unknown>

@Injectable()
export class RevokeTokensUseCase {
  constructor(
    private authTokensRepository: AuthTokensRepository,
    private verificationTokensRepository: VerificationTokensRepository,
    private logger: LoggerPort,
    private metrics: MetricsPort,
  ) {}

  @WithObservability({
    operation: 'revoke_tokens',
    identifier: 'userId',
  })
  async execute({
    userId,
  }: RevokeTokensUseCaseRequest): Promise<RevokeTokensUseCaseResponse> {
    await Promise.all([
      this.authTokensRepository.revokeTokensByUserId(userId),
      this.verificationTokensRepository.revokeTokensByUserId(userId),
    ])

    return right({})
  }
}
