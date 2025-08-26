import { Injectable } from '@nestjs/common'

import { WithObservability } from '@/core/decorators/observability.decorator'
import { type Either, left, right } from '@/core/either'
import { LoggerPort } from '@/core/ports/logger'
import { MetricsPort } from '@/core/ports/metrics'

import { User } from '../../enterprise/entities/user'
import { VerificationToken } from '../../enterprise/entities/verification-token'
import { Hasher } from '../cryptography/hasher'
import { UsersRepository } from '../repositories/users-repository'
import { VerificationTokensRepository } from '../repositories/verification-tokens-repository'
import { EmailAlreadyInUseError } from './errors/email-already-in-use'

interface EnrollIdentityUseCaseRequest {
  name: string
  email: string
  password: string
}

type EnrollIdentityUseCaseResponse = Either<Error, { user: User }>

@Injectable()
export class EnrollIdentityUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private verificationTokensRepository: VerificationTokensRepository,
    private hasher: Hasher,
    private logger: LoggerPort,
    private metrics: MetricsPort,
  ) {}

  @WithObservability({
    operation: 'enroll_identity',
    className: 'EnrollIdentity',
    identifier: 'email',
  })
  async execute({
    name,
    email,
    password,
  }: EnrollIdentityUseCaseRequest): Promise<EnrollIdentityUseCaseResponse> {
    const emailAlreadyInUse = await this.usersRepository.findByEmail(email)

    if (emailAlreadyInUse) {
      return left(new EmailAlreadyInUseError(email))
    }

    const passwordHash = await this.hasher.hash(password)

    const user = User.create({
      name,
      email,
      passwordHash,
    })

    const verificationToken = VerificationToken.create({
      userId: user.id,
      type: 'email:verify',
    })

    await Promise.all([
      this.usersRepository.create(user),
      this.verificationTokensRepository.save(verificationToken),
    ])

    return right({ user })
  }
}
