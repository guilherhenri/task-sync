import { Injectable } from '@nestjs/common'

import { type Either, left, right } from '@/core/either'

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
  ) {}

  async execute({
    userId,
  }: RenewTokenUseCaseRequest): Promise<RenewTokenUseCaseResponse> {
    const user = await this.usersRepository.findById(userId)

    if (!user) {
      return left(new ResourceNotFoundError('Usuário não encontrado.'))
    }

    const oldAuthToken = await this.authTokensRepository.findByUserId(userId)

    if (!oldAuthToken) {
      return left(new RefreshTokenExpiredError())
    }

    if (oldAuthToken.expiresAt < new Date()) {
      await this.authTokensRepository.delete(oldAuthToken)

      return left(new RefreshTokenExpiredError())
    }

    if (!oldAuthToken.userId.equals(user.id)) {
      return left(
        new ForbiddenActionError('Este token não pertence a este usuário.'),
      )
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

    return right({ accessToken })
  }
}
