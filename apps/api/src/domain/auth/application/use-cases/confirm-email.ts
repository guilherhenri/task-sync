import { Injectable } from '@nestjs/common'

import { type Either, left, right } from '@/core/either'
import { LoggerPort } from '@/core/ports/logger'

import { UsersRepository } from '../repositories/users-repository'
import { VerificationTokensRepository } from '../repositories/verification-tokens-repository'
import { ResourceGoneError } from './errors/resource-gone'
import { ResourceInvalidError } from './errors/resource-invalid'
import { ResourceNotFoundError } from './errors/resource-not-found'

interface ConfirmEmailUseCaseRequest {
  token: string
}

type ConfirmEmailUseCaseResponse = Either<
  ResourceNotFoundError | ResourceInvalidError | ResourceGoneError,
  unknown
>

@Injectable()
export class ConfirmEmailUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private verificationTokensRepository: VerificationTokensRepository,
    private logger: LoggerPort,
  ) {}

  async execute({
    token,
  }: ConfirmEmailUseCaseRequest): Promise<ConfirmEmailUseCaseResponse> {
    const startTime = Date.now()

    const verificationToken =
      (await this.verificationTokensRepository.get(token, 'email:verify')) ??
      (await this.verificationTokensRepository.get(
        token,
        'email:update:verify',
      ))

    if (!verificationToken) {
      const error = new ResourceNotFoundError('Token não encontrado.')

      this.logger.logPerformance({
        operation: 'confirm_email',
        duration: Date.now() - startTime,
        success: false,
        metadata: {
          userId: token,
          error: error.message,
        },
      })

      return left(error)
    }

    if (!verificationToken.verifyToken(token)) {
      await this.verificationTokensRepository.delete(verificationToken)

      const error = new ResourceInvalidError('Token inválido.')

      this.logger.logPerformance({
        operation: 'confirm_email',
        duration: Date.now() - startTime,
        success: false,
        metadata: {
          userId: token,
          error: error.message,
        },
      })

      return left(error)
    }

    if (verificationToken.isExpired()) {
      await this.verificationTokensRepository.delete(verificationToken)

      const error = new ResourceGoneError('Token expirado.')

      this.logger.logPerformance({
        operation: 'confirm_email',
        duration: Date.now() - startTime,
        success: false,
        metadata: {
          userId: token,
          error: error.message,
        },
      })

      return left(error)
    }

    const user = await this.usersRepository.findById(
      verificationToken.userId.toString(),
    )

    if (!user) {
      await this.verificationTokensRepository.delete(verificationToken)

      const error = new ResourceNotFoundError('Usuário não encontrado.')

      this.logger.logPerformance({
        operation: 'confirm_email',
        duration: Date.now() - startTime,
        success: false,
        metadata: {
          userId: token,
          error: error.message,
        },
      })

      return left(error)
    }

    user.verifyEmail()

    await Promise.all([
      this.usersRepository.save(user),
      this.verificationTokensRepository.delete(verificationToken),
    ])

    this.logger.logPerformance({
      operation: 'confirm_email',
      duration: Date.now() - startTime,
      success: true,
      metadata: { userId: user.id.toString() },
    })

    return right({})
  }
}
