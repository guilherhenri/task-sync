import { type Either, left, right } from '@/core/either'

import { PasswordHash } from '../../enterprise/entities/value-objects/password-hash'
import type { UsersRepository } from '../repositories/users-repository'

interface RefineProfileUseCaseRequest {
  userId: string
  name: string
  email: string
  newPassword?: string
}

type RefineProfileUseCaseResponse = Either<Error, unknown>

export class RefineProfileUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    userId,
    name,
    email,
    newPassword,
  }: RefineProfileUseCaseRequest): Promise<RefineProfileUseCaseResponse> {
    const user = await this.usersRepository.findById(userId)

    if (!user) {
      return left(new Error('Usuário não encontrado.'))
    }

    if (user.email !== email) {
      const emailAlreadyInUse = await this.usersRepository.findByEmail(email)

      if (emailAlreadyInUse) {
        return left(new Error('Este e-mail já está em uso.'))
      }
    }

    if (newPassword) {
      const newPasswordHash = await PasswordHash.create(newPassword)
      user.passwordHash = newPasswordHash
    }

    user.name = name
    user.email = email

    await this.usersRepository.save(user)

    return right({})
  }
}
