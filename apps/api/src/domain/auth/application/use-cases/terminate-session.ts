import { Injectable } from '@nestjs/common'

import { type Either, right } from '@/core/either'

import { AuthTokensRepository } from '../repositories/auth-tokens-repository'

interface TerminateSessionUseCaseRequest {
  userId: string
}

type TerminateSessionUseCaseResponse = Either<void, unknown>

@Injectable()
export class TerminateSessionUseCase {
  constructor(private authTokensRepository: AuthTokensRepository) {}

  async execute({
    userId,
  }: TerminateSessionUseCaseRequest): Promise<TerminateSessionUseCaseResponse> {
    const authToken = await this.authTokensRepository.findByUserId(userId)

    if (authToken) {
      await this.authTokensRepository.delete(authToken)
    }

    return right({})
  }
}
