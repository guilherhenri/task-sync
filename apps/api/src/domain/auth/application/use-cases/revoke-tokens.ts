import { type Either, right } from '@/core/either'

import type { VerificationTokensRepository } from '../repositories/verification-tokens-repository'

interface RevokeTokensUseCaseRequest {
  userId: string
}

type RevokeTokensUseCaseResponse = Either<void, unknown>

export class RevokeTokensUseCase {
  constructor(
    private verificationTokensRepository: VerificationTokensRepository,
  ) {}

  async execute({
    userId,
  }: RevokeTokensUseCaseRequest): Promise<RevokeTokensUseCaseResponse> {
    await this.verificationTokensRepository.revokeTokensByUserId(userId)

    return right({})
  }
}
