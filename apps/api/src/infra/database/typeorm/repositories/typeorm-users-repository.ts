import { Injectable } from '@nestjs/common'
import type { Repository } from 'typeorm'

import { DomainEvents } from '@/core/events/domain-events'
import { UsersRepository } from '@/domain/auth/application/repositories/users-repository'
import { User } from '@/domain/auth/enterprise/entities/user'
import { WinstonService } from '@/infra/logging/winston.service'

import { User as TypeOrmUser } from '../entities/user.entity'
import { TypeOrmUserMapper } from '../mappers/typeorm-user-mapper'
import { TypeOrmService } from '../typeorm.service'

@Injectable()
export class TypeOrmUsersRepository implements UsersRepository {
  private readonly usersRepository: Repository<TypeOrmUser>

  constructor(
    private readonly typeorm: TypeOrmService,
    private readonly winston: WinstonService,
  ) {
    this.usersRepository = typeorm.getRepository(TypeOrmUser)
  }

  async findById(id: string): Promise<User | null> {
    const startTime = Date.now()

    try {
      const user = await this.usersRepository.findOne({
        where: { id },
      })

      this.winston.logDatabaseQuery({
        query: 'SELECT user by id',
        duration: Date.now() - startTime,
        success: true,
        table: 'users',
        operation: 'SELECT',
      })

      if (!user) return null

      return TypeOrmUserMapper.toDomain(user)
    } catch (error) {
      this.winston.logDatabaseQuery({
        query: 'SELECT user by id',
        duration: Date.now() - startTime,
        success: false,
        table: 'users',
        operation: 'SELECT',
        error: (error as Error).message,
      })

      throw error
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    const startTime = Date.now()

    try {
      const user = await this.usersRepository.findOne({
        where: { email },
      })

      this.winston.logDatabaseQuery({
        query: 'SELECT user by email',
        duration: Date.now() - startTime,
        success: true,
        table: 'users',
        operation: 'SELECT',
      })

      if (!user) return null

      return TypeOrmUserMapper.toDomain(user)
    } catch (error) {
      this.winston.logDatabaseQuery({
        query: 'SELECT user by email',
        duration: Date.now() - startTime,
        success: false,
        table: 'users',
        operation: 'SELECT',
        error: (error as Error).message,
      })

      throw error
    }
  }

  async create(user: User): Promise<void> {
    const startTime = Date.now()

    try {
      const typeOrmUser = TypeOrmUserMapper.toTypeOrm(user)

      await this.usersRepository.save(typeOrmUser)

      this.winston.logDatabaseQuery({
        query: 'INSERT user',
        duration: Date.now() - startTime,
        success: true,
        table: 'users',
        operation: 'INSERT',
      })

      DomainEvents.dispatchEventsForAggregate(user.id)
    } catch (error) {
      this.winston.logDatabaseQuery({
        query: 'INSERT user',
        duration: Date.now() - startTime,
        success: false,
        table: 'users',
        operation: 'INSERT',
        error: (error as Error).message,
      })

      throw error
    }
  }

  async save(user: User): Promise<void> {
    const startTime = Date.now()

    try {
      const typeOrmUser = TypeOrmUserMapper.toTypeOrm(user)

      await this.usersRepository.save(typeOrmUser)

      this.winston.logDatabaseQuery({
        query: 'UPDATE user',
        duration: Date.now() - startTime,
        success: true,
        table: 'users',
        operation: 'UPDATE',
      })

      DomainEvents.dispatchEventsForAggregate(user.id)
    } catch (error) {
      this.winston.logDatabaseQuery({
        query: 'UPDATE user',
        duration: Date.now() - startTime,
        success: false,
        table: 'users',
        operation: 'UPDATE',
        error: (error as Error).message,
      })

      throw error
    }
  }
}
