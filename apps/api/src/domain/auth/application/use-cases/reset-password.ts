import { type Either, left, right } from '@/core/either'

import type { Hasher } from '../cryptography/hasher'
import type { UsersRepository } from '../repositories/users-repository'
import type { VerificationTokensRepository } from '../repositories/verification-tokens-repository'

interface ResetPasswordUseCaseRequest {
  token: string
  newPassword: string
}

type ResetPasswordUseCaseResponse = Either<Error, unknown>

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
      return left(new Error('Token não encontrado.'))
    }

    if (!verificationToken.verifyToken(token)) {
      await this.verificationTokensRepository.delete(verificationToken)

      return left(new Error('Token inválido.'))
    }

    if (verificationToken.isExpired()) {
      await this.verificationTokensRepository.delete(verificationToken)

      return left(new Error('Token expirado.'))
    }

    const user = await this.usersRepository.findById(
      verificationToken.userId.toString(),
    )

    if (!user) {
      await this.verificationTokensRepository.delete(verificationToken)

      return left(new Error('Usuário não encontrado.'))
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
