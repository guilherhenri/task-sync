import { Injectable } from '@nestjs/common'

import { type Either, right } from '@/core/either'
import { LoggerPort } from '@/core/ports/logger'

import { AuthTokensRepository } from '../repositories/auth-tokens-repository'

interface TerminateSessionUseCaseRequest {
  userId: string
}

type TerminateSessionUseCaseResponse = Either<void, unknown>

@Injectable()
export class TerminateSessionUseCase {
  constructor(
    private authTokensRepository: AuthTokensRepository,
    private logger: LoggerPort,
  ) {}

  async execute({
    userId,
  }: TerminateSessionUseCaseRequest): Promise<TerminateSessionUseCaseResponse> {
    const startTime = Date.now()

    const authToken = await this.authTokensRepository.findByUserId(userId)

    if (authToken) {
      await this.authTokensRepository.delete(authToken)
    }

    this.logger.logPerformance({
      operation: 'terminate_session',
      duration: Date.now() - startTime,
      success: true,
      metadata: { userId },
    })

    return right({})
  }
}
