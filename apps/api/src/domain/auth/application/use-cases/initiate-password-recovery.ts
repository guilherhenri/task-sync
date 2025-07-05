import { type Either, left, right } from '@/core/either'

import { VerificationToken } from '../../enterprise/entities/verification-token'
import type { UsersRepository } from '../repositories/users-repository'
import type { VerificationTokensRepository } from '../repositories/verification-tokens-repository'

interface InitiatePasswordRecoveryUseCaseRequest {
  email: string
}

type InitiatePasswordRecoveryUseCaseResponse = Either<Error, unknown>

export class InitiatePasswordRecoveryUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private verificationTokensRepository: VerificationTokensRepository,
  ) {}

  async execute({
    email,
  }: InitiatePasswordRecoveryUseCaseRequest): Promise<InitiatePasswordRecoveryUseCaseResponse> {
    const user = await this.usersRepository.findByEmail(email)

    if (user) {
      if (!user.emailVerified) {
        return left(
          new Error(
            'Este endereço de e-mail ainda não foi verificado, por favor cheque seu e-mail.',
          ),
        )
      }

      const verificationToken = VerificationToken.create({
        userId: user.id,
        type: 'password:recovery',
      })

      await this.verificationTokensRepository.save(verificationToken)
    }

    return right({})
  }
}
