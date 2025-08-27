import { Injectable } from '@nestjs/common'
import type { Repository } from 'typeorm'

import { DomainEvents } from '@/core/events/domain-events'
import { UsersRepository } from '@/domain/auth/application/repositories/users-repository'
import { User } from '@/domain/auth/enterprise/entities/user'
import { ObservableRepository } from '@/infra/observability/observable-repository'

import { User as TypeOrmUser } from '../entities/user.entity'
import { TypeOrmUserMapper } from '../mappers/typeorm-user-mapper'
import { TypeOrmService } from '../typeorm.service'

@Injectable()
export class TypeOrmUsersRepository
  extends ObservableRepository
  implements UsersRepository
{
  private readonly usersRepository: Repository<TypeOrmUser>

  constructor(private readonly typeorm: TypeOrmService) {
    super()
    this.usersRepository = typeorm.getRepository(TypeOrmUser)
  }

  async findById(id: string): Promise<User | null> {
    return this.trackOperation(
      async () => {
        const user = await this.usersRepository.findOne({
          where: { id },
        })

        if (!user) return null

        return TypeOrmUserMapper.toDomain(user)
      },
      { query: 'SELECT user by id', operation: 'SELECT', table: 'users' },
    )
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.trackOperation(
      async () => {
        const user = await this.usersRepository.findOne({
          where: { email },
        })

        if (!user) return null

        return TypeOrmUserMapper.toDomain(user)
      },
      { query: 'SELECT user by email', operation: 'SELECT', table: 'users' },
    )
  }

  async create(user: User): Promise<void> {
    await this.trackOperation(
      async () => {
        const typeOrmUser = TypeOrmUserMapper.toTypeOrm(user)

        await this.usersRepository.save(typeOrmUser)

        DomainEvents.dispatchEventsForAggregate(user.id)
      },
      { query: 'INSERT user', operation: 'INSERT', table: 'users' },
    )
  }

  async save(user: User): Promise<void> {
    await this.trackOperation(
      async () => {
        const typeOrmUser = TypeOrmUserMapper.toTypeOrm(user)

        await this.usersRepository.save(typeOrmUser)

        DomainEvents.dispatchEventsForAggregate(user.id)
      },
      { query: 'UPDATE user', operation: 'UPDATE', table: 'users' },
    )
  }
}
