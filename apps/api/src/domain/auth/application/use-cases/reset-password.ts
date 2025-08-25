import { Injectable } from '@nestjs/common'

import { type Either, left, right } from '@/core/either'
import { LoggerPort } from '@/core/ports/logger'

import { Hasher } from '../cryptography/hasher'
import { UsersRepository } from '../repositories/users-repository'
import { VerificationTokensRepository } from '../repositories/verification-tokens-repository'
import { ResourceGoneError } from './errors/resource-gone'
import { ResourceInvalidError } from './errors/resource-invalid'
import { ResourceNotFoundError } from './errors/resource-not-found'

interface ResetPasswordUseCaseRequest {
  token: string
  newPassword: string
}

type ResetPasswordUseCaseResponse = Either<
  ResourceNotFoundError | ResourceInvalidError | ResourceGoneError,
  unknown
>

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private verificationTokensRepository: VerificationTokensRepository,
    private hasher: Hasher,
    private logger: LoggerPort,
  ) {}

  async execute({
    token,
    newPassword,
  }: ResetPasswordUseCaseRequest): Promise<ResetPasswordUseCaseResponse> {
    const startTime = Date.now()

    const verificationToken = await this.verificationTokensRepository.get(
      token,
      'password:recovery',
    )

    if (!verificationToken) {
      const error = new ResourceNotFoundError('Token não encontrado.')

      this.logger.logPerformance({
        operation: 'reset_password',
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
        operation: 'reset_password',
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
        operation: 'reset_password',
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
        operation: 'reset_password',
        duration: Date.now() - startTime,
        success: false,
        metadata: {
          userId: token,
          error: error.message,
        },
      })

      return left(error)
    }

    const newPasswordHash = await this.hasher.hash(newPassword)

    await user.resetPassword(newPasswordHash)

    await Promise.all([
      this.usersRepository.save(user),
      this.verificationTokensRepository.delete(verificationToken),
    ])

    this.logger.logPerformance({
      operation: 'reset_password',
      duration: Date.now() - startTime,
      success: true,
      metadata: { userId: user.id.toString() },
    })

    return right({})
  }
}
