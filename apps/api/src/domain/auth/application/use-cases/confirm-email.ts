import { Injectable } from '@nestjs/common'

import { type Either, left, right } from '@/core/either'

import { UsersRepository } from '../repositories/users-repository'
import { VerificationTokensRepository } from '../repositories/verification-tokens-repository'
import { ResourceGoneUseError } from './errors/resource-gone'
import { ResourceInvalidUseError } from './errors/resource-invalid'
import { ResourceNotFoundUseError } from './errors/resource-not-found'

interface ConfirmEmailUseCaseRequest {
  token: string
}

type ConfirmEmailUseCaseResponse = Either<
  ResourceNotFoundUseError | ResourceInvalidUseError | ResourceGoneUseError,
  unknown
>

@Injectable()
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
      return left(new ResourceNotFoundUseError('Token não encontrado.'))
    }

    if (!verificationToken.verifyToken(token)) {
      await this.verificationTokensRepository.delete(verificationToken)

      return left(new ResourceInvalidUseError('Token inválido.'))
    }

    if (verificationToken.isExpired()) {
      await this.verificationTokensRepository.delete(verificationToken)

      return left(new ResourceGoneUseError('Token expirado.'))
    }

    const user = await this.usersRepository.findById(
      verificationToken.userId.toString(),
    )

    if (!user) {
      await this.verificationTokensRepository.delete(verificationToken)

      return left(new ResourceNotFoundUseError('Usuário não encontrado.'))
    }

    user.verifyEmail()

    await Promise.all([
      this.usersRepository.save(user),
      this.verificationTokensRepository.delete(verificationToken),
    ])

    return right({})
  }
}
