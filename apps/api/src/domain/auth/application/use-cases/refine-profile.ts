import { Injectable } from '@nestjs/common'

import { WithObservability } from '@/core/decorators/observability.decorator'
import { type Either, left, right } from '@/core/either'
import { LoggerPort } from '@/core/ports/logger'
import { MetricsPort } from '@/core/ports/metrics'

import { VerificationToken } from '../../enterprise/entities/verification-token'
import { Hasher } from '../cryptography/hasher'
import { UsersRepository } from '../repositories/users-repository'
import { VerificationTokensRepository } from '../repositories/verification-tokens-repository'
import { EmailAlreadyInUseError } from './errors/email-already-in-use'
import { ResourceNotFoundError } from './errors/resource-not-found'

interface RefineProfileUseCaseRequest {
  userId: string
  name: string
  email: string
  newPassword?: string
}

type RefineProfileUseCaseResponse = Either<
  ResourceNotFoundError | EmailAlreadyInUseError,
  unknown
>

@Injectable()
export class RefineProfileUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private verificationTokensRepository: VerificationTokensRepository,
    private hasher: Hasher,
    private logger: LoggerPort,
    private metrics: MetricsPort,
  ) {}

  @WithObservability({
    operation: 'refine_profile',
    identifier: 'userId',
  })
  async execute({
    userId,
    name,
    email,
    newPassword,
  }: RefineProfileUseCaseRequest): Promise<RefineProfileUseCaseResponse> {
    const user = await this.usersRepository.findById(userId)

    if (!user) {
      return left(new ResourceNotFoundError('Usuário não encontrado.'))
    }

    let verificationToken: VerificationToken | null = null

    if (user.email !== email) {
      const emailAlreadyInUse = await this.usersRepository.findByEmail(email)

      if (emailAlreadyInUse) {
        return left(new EmailAlreadyInUseError(email))
      }

      verificationToken = VerificationToken.create({
        userId: user.id,
        type: 'email:update:verify',
      })

      user.resetEmailVerification()
    }

    if (newPassword) {
      const newPasswordHash = await this.hasher.hash(newPassword)
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
