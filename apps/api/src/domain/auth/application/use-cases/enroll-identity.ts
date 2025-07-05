import { type Either, left, right } from '@/core/either'

import { User } from '../../enterprise/entities/user'
import { VerificationToken } from '../../enterprise/entities/verification-token'
import type { UsersRepository } from '../repositories/users-repository'
import type { VerificationTokensRepository } from '../repositories/verification-tokens-repository'

interface EnrollIdentityUseCaseRequest {
  name: string
  email: string
  password: string
  avatarUrl?: string
}

type EnrollIdentityUseCaseResponse = Either<Error, { user: User }>

export class EnrollIdentityUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private verificationTokensRepository: VerificationTokensRepository,
  ) {}

  async execute({
    name,
    email,
    password,
    avatarUrl,
  }: EnrollIdentityUseCaseRequest): Promise<EnrollIdentityUseCaseResponse> {
    const emailAlreadyInUse = await this.usersRepository.findByEmail(email)

    if (emailAlreadyInUse) {
      return left(new Error('Este e-mail já está em uso.'))
    }

    const user = await User.create({
      name,
      email,
      password,
      avatarUrl,
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
