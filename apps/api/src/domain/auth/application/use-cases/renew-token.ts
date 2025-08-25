import { Injectable } from '@nestjs/common'

import { type Either, left, right } from '@/core/either'
import { LoggerPort } from '@/core/ports/logger'

import { AuthToken } from '../../enterprise/entities/auth-token'
import { Encryptor } from '../cryptography/encryptor'
import { AuthTokensRepository } from '../repositories/auth-tokens-repository'
import { UsersRepository } from '../repositories/users-repository'
import { ForbiddenActionError } from './errors/forbidden-action'
import { RefreshTokenExpiredError } from './errors/refresh-token-expired'
import { ResourceNotFoundError } from './errors/resource-not-found'

interface RenewTokenUseCaseRequest {
  userId: string
}

type RenewTokenUseCaseResponse = Either<
  ResourceNotFoundError | RefreshTokenExpiredError | ForbiddenActionError,
  { accessToken: string }
>

@Injectable()
export class RenewTokenUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private authTokensRepository: AuthTokensRepository,
    private encryptor: Encryptor,
    private logger: LoggerPort,
  ) {}

  async execute({
    userId,
  }: RenewTokenUseCaseRequest): Promise<RenewTokenUseCaseResponse> {
    const startTime = Date.now()

    const user = await this.usersRepository.findById(userId)

    if (!user) {
      const error = new ResourceNotFoundError('Usuário não encontrado.')

      this.logger.logPerformance({
        operation: 'renew_token',
        duration: Date.now() - startTime,
        success: false,
        metadata: {
          userId,
          error: error.message,
        },
      })

      return left(error)
    }

    const oldAuthToken = await this.authTokensRepository.findByUserId(userId)

    if (!oldAuthToken) {
      const error = new RefreshTokenExpiredError()

      this.logger.logPerformance({
        operation: 'renew_token',
        duration: Date.now() - startTime,
        success: false,
        metadata: {
          userId,
          error: error.message,
        },
      })

      return left(error)
    }

    if (oldAuthToken.expiresAt < new Date()) {
      await this.authTokensRepository.delete(oldAuthToken)

      const error = new RefreshTokenExpiredError()

      this.logger.logPerformance({
        operation: 'renew_token',
        duration: Date.now() - startTime,
        success: false,
        metadata: {
          userId,
          error: error.message,
        },
      })

      return left(error)
    }

    if (!oldAuthToken.userId.equals(user.id)) {
      const error = new ForbiddenActionError(
        'Este token não pertence a este usuário.',
      )

      this.logger.logPerformance({
        operation: 'renew_token',
        duration: Date.now() - startTime,
        success: false,
        metadata: {
          userId,
          error: error.message,
        },
      })

      return left(error)
    }

    await this.authTokensRepository.delete(oldAuthToken)

    const accessToken = await this.encryptor.encrypt({
      sub: user.id.toString(),
    })
    const newRefreshToken = await this.encryptor.encrypt({
      sub: user.id.toString(),
    })

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 dias

    const authToken = AuthToken.create({
      userId: user.id,
      refreshToken: newRefreshToken,
      expiresAt,
    })

    await this.authTokensRepository.create(authToken)

    this.logger.logPerformance({
      operation: 'renew_token',
      duration: Date.now() - startTime,
      success: true,
      metadata: { userId },
    })

    return right({ accessToken })
  }
}
