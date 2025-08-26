import { Injectable } from '@nestjs/common'

import { WithObservability } from '@/core/decorators/observability.decorator'
import { type Either, left, right } from '@/core/either'
import { LoggerPort } from '@/core/ports/logger'
import { MetricsPort } from '@/core/ports/metrics'

import { VerificationToken } from '../../enterprise/entities/verification-token'
import { UsersRepository } from '../repositories/users-repository'
import { VerificationTokensRepository } from '../repositories/verification-tokens-repository'

interface InitiatePasswordRecoveryUseCaseRequest {
  email: string
}

type InitiatePasswordRecoveryUseCaseResponse = Either<Error, unknown>

@Injectable()
export class InitiatePasswordRecoveryUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private verificationTokensRepository: VerificationTokensRepository,
    private logger: LoggerPort,
    private metrics: MetricsPort,
  ) {}

  @WithObservability({
    operation: 'initiate_password_recovery',
    className: 'InitiatePasswordRecovery',
    identifier: 'email',
  })
  async execute({
    email,
  }: InitiatePasswordRecoveryUseCaseRequest): Promise<InitiatePasswordRecoveryUseCaseResponse> {
    const user = await this.usersRepository.findByEmail(email)

    if (user) {
      if (!user.emailVerified) {
        return left(
          new Error(
            'Este endereço de e-mail ainda não foi verificado, por favor cheque seu e-mail.',
          ),
        )
      }

      const verificationToken = VerificationToken.create({
        userId: user.id,
        type: 'password:recovery',
      })

      await this.verificationTokensRepository.save(verificationToken)
    }

    return right({})
  }
}
