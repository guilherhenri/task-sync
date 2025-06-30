import { createHash } from 'crypto'

import { type Either, left, right } from '@/core/either'

import type { UsersRepository } from '../repositories/users-repository'
import type { TokenService } from '../services/token-service'

interface ConfirmEmailUseCaseRequest {
  token: string
}

type ConfirmEmailUseCaseResponse = Either<Error, unknown>

export class ConfirmEmailUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private tokenService: TokenService,
  ) {}

  async execute({
    token,
  }: ConfirmEmailUseCaseRequest): Promise<ConfirmEmailUseCaseResponse> {
    const tokenHash = createHash('sha256').update(token).digest('hex')
    const key = `email:verify:${tokenHash}`

    const value = await this.tokenService.get(key)

    if (!value) {
      return left(new Error('Token inválido.'))
    }

    const data = JSON.parse(value) as { userId: string; expiresAt: string }

    if (new Date(data.expiresAt) < new Date()) {
      await this.tokenService.delete(key)

      return left(new Error('Token expirado.'))
    }

    const user = await this.usersRepository.findById(data.userId)

    if (!user) {
      await this.tokenService.delete(key)

      return left(new Error('Usuário não encontrado.'))
    }

    user.verifyEmail()

    await this.usersRepository.save(user)

    return right({})
  }
}
