import { type Either, left, right } from '@/core/either'

import { PasswordHash } from '../../enterprise/entities/value-objects/password-hash'
import { VerificationToken } from '../../enterprise/entities/verification-token'
import type { UsersRepository } from '../repositories/users-repository'
import type { VerificationTokensRepository } from '../repositories/verification-tokens-repository'

interface RefineProfileUseCaseRequest {
  userId: string
  name: string
  email: string
  newPassword?: string
}

type RefineProfileUseCaseResponse = Either<Error, unknown>

export class RefineProfileUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private verificationTokensRepository: VerificationTokensRepository,
  ) {}

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

    let verificationToken: VerificationToken | null = null

    if (user.email !== email) {
      const emailAlreadyInUse = await this.usersRepository.findByEmail(email)

      if (emailAlreadyInUse) {
        return left(new Error('Este e-mail já está em uso.'))
      }

      verificationToken = VerificationToken.create({
        userId: user.id,
        type: 'email:update:verify',
      })
    }

    if (newPassword) {
      const newPasswordHash = await PasswordHash.create(newPassword)
      user.passwordHash = newPasswordHash
    }

    user.name = name
    user.email = email

    await Promise.all([
      this.usersRepository.save(user),
      verificationToken &&
        this.verificationTokensRepository.save(verificationToken),
    ])

    return right({})
  }
}
