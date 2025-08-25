import { Injectable } from '@nestjs/common'

import { type Either, left, right } from '@/core/either'
import { LoggerPort } from '@/core/ports/logger'

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
  constructor(
    private usersRepository: UsersRepository,
    private logger: LoggerPort,
  ) {}

  async execute({
    userId,
  }: RetrieveProfileUseCaseRequest): Promise<RetrieveProfileUseCaseResponse> {
    const startTime = Date.now()

    const user = await this.usersRepository.findById(userId)

    if (!user) {
      const error = new ResourceNotFoundError('Usuário não encontrado.')

      this.logger.logPerformance({
        operation: 'authenticate_session',
        duration: Date.now() - startTime,
        success: false,
        metadata: {
          userId,
          error: error.message,
        },
      })

      return left(error)
    }

    this.logger.logPerformance({
      operation: 'retrieve_profile',
      duration: Date.now() - startTime,
      success: true,
      metadata: { userId },
    })

    return right({ user })
  }
}
