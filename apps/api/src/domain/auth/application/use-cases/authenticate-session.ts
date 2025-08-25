import { Injectable } from '@nestjs/common'

import { type Either, left, right } from '@/core/either'
import { LoggerPort } from '@/core/ports/logger'

import { AuthToken } from '../../enterprise/entities/auth-token'
import { Encryptor } from '../cryptography/encryptor'
import { Hasher } from '../cryptography/hasher'
import { AuthTokensRepository } from '../repositories/auth-tokens-repository'
import { UsersRepository } from '../repositories/users-repository'
import { InvalidCredentialsError } from './errors/invalid-credentials'

interface AuthenticateSessionUseCaseRequest {
  email: string
  password: string
}

type AuthenticateSessionUseCaseResponse = Either<
  InvalidCredentialsError,
  { accessToken: string }
>

@Injectable()
export class AuthenticateSessionUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private authTokensRepository: AuthTokensRepository,
    private encryptor: Encryptor,
    private hasher: Hasher,
    private logger: LoggerPort,
  ) {}

  async execute({
    email,
    password,
  }: AuthenticateSessionUseCaseRequest): Promise<AuthenticateSessionUseCaseResponse> {
    const startTime = Date.now()

    const user = await this.usersRepository.findByEmail(email)

    if (!user) {
      const error = new InvalidCredentialsError()

      this.logger.logPerformance({
        operation: 'authenticate_session',
        duration: Date.now() - startTime,
        success: false,
        metadata: {
          userId: email,
          error: error.message,
        },
      })

      return left(error)
    }

    const isPasswordMatch = await this.hasher.compare(
      password,
      user.passwordHash,
    )

    if (!isPasswordMatch) {
      const error = new InvalidCredentialsError()

      this.logger.logPerformance({
        operation: 'authenticate_session',
        duration: Date.now() - startTime,
        success: false,
        metadata: {
          userId: email,
          error: error.message,
        },
      })

      return left(error)
    }

    const accessToken = await this.encryptor.encrypt({
      sub: user.id.toString(),
    })
    const refreshToken = await this.encryptor.encrypt({
      sub: user.id.toString(),
    })

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 dias

    const authToken = AuthToken.create({
      userId: user.id,
      refreshToken,
      expiresAt,
    })

    await this.authTokensRepository.create(authToken)

    this.logger.logPerformance({
      operation: 'authenticate_session',
      duration: Date.now() - startTime,
      success: true,
      metadata: { userId: email },
    })

    return right({ accessToken })
  }
}
