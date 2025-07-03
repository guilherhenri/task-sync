import { createHash } from 'node:crypto'

import { type Either, left, right } from '@/core/either'

import { PasswordHash } from '../../enterprise/entities/value-objects/password-hash'
import type { UsersRepository } from '../repositories/users-repository'
import type { TokenService } from '../services/token-service'

interface ResetPasswordUseCaseRequest {
  token: string
  newPassword: string
}

type ResetPasswordUseCaseResponse = Either<Error, unknown>

export class ResetPasswordUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private tokenService: TokenService,
  ) {}

  async execute({
    token,
    newPassword,
  }: ResetPasswordUseCaseRequest): Promise<ResetPasswordUseCaseResponse> {
    const tokenHash = createHash('sha256').update(token).digest('hex')
    const key = `password:recovery:${tokenHash}`

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

    const newPasswordHash = await PasswordHash.create(newPassword)

    user.passwordHash = newPasswordHash

    await this.usersRepository.save(user)
    await this.tokenService.delete(key)

    return right({})
  }
}
