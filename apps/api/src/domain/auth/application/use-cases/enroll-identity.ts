import { type Either, left, right } from '@/core/either'

import { User } from '../../enterprise/entities/user'
import type { UsersRepository } from '../repositories/users-repository'

interface EnrollIdentityUseCaseRequest {
  name: string
  email: string
  password: string
  avatarUrl?: string
}

type EnrollIdentityUseCaseResponse = Either<Error, { user: User }>

export class EnrollIdentityUseCase {
  constructor(private usersRepository: UsersRepository) {}

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

    await this.usersRepository.create(user)

    return right({ user })
  }
}
