import { Injectable } from '@nestjs/common'

import { type Either, left, right } from '@/core/either'

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
  ) {}

  async execute({
    email,
    password,
  }: AuthenticateSessionUseCaseRequest): Promise<AuthenticateSessionUseCaseResponse> {
    const user = await this.usersRepository.findByEmail(email)

    if (!user) {
      return left(new InvalidCredentialsError())
    }

    const isPasswordMatch = await this.hasher.compare(
      password,
      user.passwordHash,
    )

    if (!isPasswordMatch) {
      return left(new InvalidCredentialsError())
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

    return right({ accessToken })
  }
}
