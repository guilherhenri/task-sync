import { type Either, left, right } from '@/core/either'

import type { UsersRepository } from '../repositories/users-repository'
import type { VerificationTokensRepository } from '../repositories/verification-tokens-repository'

interface ConfirmEmailUseCaseRequest {
  token: string
}

type ConfirmEmailUseCaseResponse = Either<Error, unknown>

export class ConfirmEmailUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private verificationTokensRepository: VerificationTokensRepository,
  ) {}

  async execute({
    token,
  }: ConfirmEmailUseCaseRequest): Promise<ConfirmEmailUseCaseResponse> {
    const verificationToken =
      (await this.verificationTokensRepository.get(token, 'email:verify')) ??
      (await this.verificationTokensRepository.get(
        token,
        'email:update:verify',
      ))

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

    user.verifyEmail()

    await Promise.all([
      this.usersRepository.save(user),
      this.verificationTokensRepository.delete(verificationToken),
    ])

    return right({})
  }
}
