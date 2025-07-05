import { type Either, left, right } from '@/core/either'

import type { AuthTokensRepository } from '../repositories/auth-tokens-repository'

interface TerminateSessionUseCaseRequest {
  userId: string
  refreshToken: string
}

type TerminateSessionUseCaseResponse = Either<Error, unknown>

export class TerminateSessionUseCase {
  constructor(private authTokensRepository: AuthTokensRepository) {}

  async execute({
    userId,
    refreshToken,
  }: TerminateSessionUseCaseRequest): Promise<TerminateSessionUseCaseResponse> {
    const authToken =
      await this.authTokensRepository.findByRefreshToken(refreshToken)

    if (!authToken) {
      return left(new Error('Token não encontrado.'))
    }

    if (authToken.userId.toString() !== userId) {
      return left(new Error('Este token não pertence a este usuário.'))
    }

    await this.authTokensRepository.delete(authToken)

    return right({})
  }
}
