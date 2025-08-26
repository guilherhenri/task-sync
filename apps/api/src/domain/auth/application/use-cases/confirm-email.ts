import { Injectable } from '@nestjs/common'

import { WithObservability } from '@/core/decorators/observability.decorator'
import { type Either, left, right } from '@/core/either'
import { LoggerPort } from '@/core/ports/logger'
import { MetricsPort } from '@/core/ports/metrics'

import { UsersRepository } from '../repositories/users-repository'
import { VerificationTokensRepository } from '../repositories/verification-tokens-repository'
import { ResourceGoneError } from './errors/resource-gone'
import { ResourceInvalidError } from './errors/resource-invalid'
import { ResourceNotFoundError } from './errors/resource-not-found'

interface ConfirmEmailUseCaseRequest {
  token: string
}

type ConfirmEmailUseCaseResponse = Either<
  ResourceNotFoundError | ResourceInvalidError | ResourceGoneError,
  unknown
>

@Injectable()
export class ConfirmEmailUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private verificationTokensRepository: VerificationTokensRepository,
    private logger: LoggerPort,
    private metrics: MetricsPort,
  ) {}

  @WithObservability({
    operation: 'confirm_email',
    className: 'ConfirmEmail',
    identifier: 'token',
  })
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

    user.verifyEmail()

    await Promise.all([
      this.usersRepository.save(user),
      this.verificationTokensRepository.delete(verificationToken),
    ])

    return right({})
  }
}
