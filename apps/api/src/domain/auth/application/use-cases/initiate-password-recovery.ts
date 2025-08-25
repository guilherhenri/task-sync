import { Injectable } from '@nestjs/common'

import { type Either, left, right } from '@/core/either'
import { LoggerPort } from '@/core/ports/logger'

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
  ) {}

  async execute({
    email,
  }: InitiatePasswordRecoveryUseCaseRequest): Promise<InitiatePasswordRecoveryUseCaseResponse> {
    const startTime = Date.now()

    const user = await this.usersRepository.findByEmail(email)

    if (user) {
      if (!user.emailVerified) {
        const error = new Error(
          'Este endereço de e-mail ainda não foi verificado, por favor cheque seu e-mail.',
        )

        this.logger.logPerformance({
          operation: 'initiate_password_recovery',
          duration: Date.now() - startTime,
          success: false,
          metadata: {
            userId: email,
            error: error.message,
          },
        })

        return left(error)
      }

      const verificationToken = VerificationToken.create({
        userId: user.id,
        type: 'password:recovery',
      })

      await this.verificationTokensRepository.save(verificationToken)
    }

    this.logger.logPerformance({
      operation: 'initiate_password_recovery',
      duration: Date.now() - startTime,
      success: true,
      metadata: { userId: email },
    })

    return right({})
  }
}
