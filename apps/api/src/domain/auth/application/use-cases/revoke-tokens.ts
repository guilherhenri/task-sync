import { Injectable } from '@nestjs/common'

import { type Either, right } from '@/core/either'
import { LoggerPort } from '@/core/ports/logger'

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
  ) {}

  async execute({
    userId,
  }: RevokeTokensUseCaseRequest): Promise<RevokeTokensUseCaseResponse> {
    const startTime = Date.now()

    await Promise.all([
      this.authTokensRepository.revokeTokensByUserId(userId),
      this.verificationTokensRepository.revokeTokensByUserId(userId),
    ])

    this.logger.logPerformance({
      operation: 'revoke_tokens',
      duration: Date.now() - startTime,
      success: true,
      metadata: { userId },
    })

    return right({})
  }
}
