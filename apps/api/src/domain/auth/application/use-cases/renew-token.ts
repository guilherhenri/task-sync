import { type Either, left, right } from '@/core/either'

import { AuthToken } from '../../enterprise/entities/auth-token'
import type { AuthTokensRepository } from '../repositories/auth-tokens-repository'
import type { UsersRepository } from '../repositories/users-repository'
import type { AuthService } from '../services/auth-service'

interface RenewTokenUseCaseRequest {
  userId: string
  refreshToken: string
}

type RenewTokenUseCaseResponse = Either<
  Error,
  { accessToken: string; refreshToken: string }
>

export class RenewTokenUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private authTokensRepository: AuthTokensRepository,
    private authService: AuthService,
  ) {}

  async execute({
    userId,
    refreshToken,
  }: RenewTokenUseCaseRequest): Promise<RenewTokenUseCaseResponse> {
    const user = await this.usersRepository.findById(userId)

    if (!user) {
      return left(Error('Usuário não encontrado.'))
    }

    const oldAuthToken =
      await this.authTokensRepository.findByRefreshToken(refreshToken)

    if (!oldAuthToken) {
      return left(new Error('Token não encontrado.'))
    }

    if (oldAuthToken.expiresAt < new Date()) {
      await this.authTokensRepository.delete(oldAuthToken)

      return left(new Error('Token expirado.'))
    }

    if (oldAuthToken.userId !== user.id) {
      return left(new Error('Este token não pertence a este usuário.'))
    }

    await this.authTokensRepository.delete(oldAuthToken)

    const accessToken = this.authService.generateAccessToken(user.id.toString())
    const newRefreshToken = this.authService.generateRefreshToken(
      user.id.toString(),
    )

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 dias

    const authToken = AuthToken.create({
      userId: user.id,
      refreshToken: newRefreshToken,
      expiresAt,
    })

    await this.authTokensRepository.create(authToken)

    return right({ accessToken, refreshToken: newRefreshToken })
  }
}
