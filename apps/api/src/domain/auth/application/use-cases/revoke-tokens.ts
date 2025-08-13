import { Injectable } from '@nestjs/common'

import { type Either, right } from '@/core/either'

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
  ) {}

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
