import { Injectable } from '@nestjs/common'

import { type Either, left, right } from '@/core/either'

import type { User } from '../../enterprise/entities/user'
import { UsersRepository } from '../repositories/users-repository'
import { ResourceNotFoundError } from './errors/resource-not-found'

interface RetrieveProfileUseCaseRequest {
  userId: string
}

type RetrieveProfileUseCaseResponse = Either<
  ResourceNotFoundError,
  { user: User }
>

@Injectable()
export class RetrieveProfileUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    userId,
  }: RetrieveProfileUseCaseRequest): Promise<RetrieveProfileUseCaseResponse> {
    const user = await this.usersRepository.findById(userId)

    if (!user) {
      return left(new ResourceNotFoundError('Usuário não encontrado.'))
    }

    return right({ user })
  }
}
