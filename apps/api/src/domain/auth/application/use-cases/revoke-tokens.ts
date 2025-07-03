import { type Either, right } from '@/core/either'

import type { TokenService } from '../services/token-service'

interface RevokeTokensUseCaseRequest {
  userId: string
}

type RevokeTokensUseCaseResponse = Either<void, unknown>

export class RevokeTokensUseCase {
  constructor(private tokenService: TokenService) {}

  async execute({
    userId,
  }: RevokeTokensUseCaseRequest): Promise<RevokeTokensUseCaseResponse> {
    await this.tokenService.revokeTokensByUserId(userId)

    return right({})
  }
}
