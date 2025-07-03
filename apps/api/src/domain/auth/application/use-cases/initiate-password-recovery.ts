import { createHash, randomUUID } from 'node:crypto'

import { type Either, left, right } from '@/core/either'

import type { UsersRepository } from '../repositories/users-repository'
import type { TokenService } from '../services/token-service'

interface InitiatePasswordRecoveryUseCaseRequest {
  email: string
}

type InitiatePasswordRecoveryUseCaseResponse = Either<Error, unknown>

export class InitiatePasswordRecoveryUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private tokenService: TokenService,
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

      const token = randomUUID()
      const tokenHash = createHash('sha256').update(token).digest('hex')
      const key = `password:recovery:${tokenHash}`

      const twentyFourHoursInSeconds = 24 * 60 * 60

      const value = JSON.stringify({
        userId: user.id.toString(),
        expiresAt: new Date(
          Date.now() + twentyFourHoursInSeconds * 1000,
        ).toISOString(),
      })

      await this.tokenService.save(key, value, twentyFourHoursInSeconds)
    }

    return right({})
  }
}
