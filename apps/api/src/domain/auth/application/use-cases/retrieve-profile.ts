import { type Either, left, right } from '@/core/either'

import type { User } from '../../enterprise/entities/user'
import type { UsersRepository } from '../repositories/users-repository'

interface RetrieveProfileUseCaseRequest {
  userId: string
}

type RetrieveProfileUseCaseResponse = Either<Error, { user: User }>

export class RetrieveProfileUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    userId,
  }: RetrieveProfileUseCaseRequest): Promise<RetrieveProfileUseCaseResponse> {
    const user = await this.usersRepository.findById(userId)

    if (!user) {
      return left(new Error('Usuário não encontrado.'))
    }

    return right({ user })
  }
}
