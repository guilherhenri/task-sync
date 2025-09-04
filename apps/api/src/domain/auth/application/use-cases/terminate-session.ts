import { Injectable } from '@nestjs/common'

import { WithObservability } from '@/core/decorators/observability.decorator'
import { type Either, right } from '@/core/either'
import { LoggerPort } from '@/core/ports/logger'
import { MetricsPort } from '@/core/ports/metrics'

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
    private metrics: MetricsPort,
  ) {}

  @WithObservability({
    operation: 'terminate_session',
    identifier: 'userId',
  })
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
