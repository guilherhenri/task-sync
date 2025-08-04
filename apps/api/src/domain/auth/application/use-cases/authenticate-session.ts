import { type Either, left, right } from '@/core/either'

import { AuthToken } from '../../enterprise/entities/auth-token'
import type { Hasher } from '../cryptography/hasher'
import type { AuthTokensRepository } from '../repositories/auth-tokens-repository'
import type { UsersRepository } from '../repositories/users-repository'
import type { AuthService } from '../services/auth-service'

interface AuthenticateSessionUseCaseRequest {
  email: string
  password: string
}

type AuthenticateSessionUseCaseResponse = Either<
  Error,
  { accessToken: string; refreshToken: string }
>

export class AuthenticateSessionUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private authTokensRepository: AuthTokensRepository,
    private authService: AuthService,
    private hasher: Hasher,
  ) {}

  async execute({
    email,
    password,
  }: AuthenticateSessionUseCaseRequest): Promise<AuthenticateSessionUseCaseResponse> {
    const user = await this.usersRepository.findByEmail(email)

    if (!user) {
      return left(new Error('E-mail ou senha inválidos.'))
    }

    const isPasswordMatch = await this.hasher.compare(
      password,
      user.passwordHash,
    )

    if (!isPasswordMatch) {
      return left(new Error('E-mail ou senha inválidos.'))
    }

    const accessToken = this.authService.generateAccessToken(user.id.toString())
    const refreshToken = this.authService.generateRefreshToken(
      user.id.toString(),
    )

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 dias

    const authToken = AuthToken.create({
      userId: user.id,
      refreshToken,
      expiresAt,
    })

    await this.authTokensRepository.create(authToken)

    return right({ accessToken, refreshToken })
  }
}
