import { Injectable } from '@nestjs/common'

import { type Either, left, right } from '@/core/either'

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
  ) {}

  async execute({
    token,
    newPassword,
  }: ResetPasswordUseCaseRequest): Promise<ResetPasswordUseCaseResponse> {
    const verificationToken = await this.verificationTokensRepository.get(
      token,
      'password:recovery',
    )

    if (!verificationToken) {
      return left(new ResourceNotFoundError('Token não encontrado.'))
    }

    if (!verificationToken.verifyToken(token)) {
      await this.verificationTokensRepository.delete(verificationToken)

      return left(new ResourceInvalidError('Token inválido.'))
    }

    if (verificationToken.isExpired()) {
      await this.verificationTokensRepository.delete(verificationToken)

      return left(new ResourceGoneError('Token expirado.'))
    }

    const user = await this.usersRepository.findById(
      verificationToken.userId.toString(),
    )

    if (!user) {
      await this.verificationTokensRepository.delete(verificationToken)

      return left(new ResourceNotFoundError('Usuário não encontrado.'))
    }

    const newPasswordHash = await this.hasher.hash(newPassword)

    await user.resetPassword(newPasswordHash)

    await Promise.all([
      this.usersRepository.save(user),
      this.verificationTokensRepository.delete(verificationToken),
    ])

    return right({})
  }
}
