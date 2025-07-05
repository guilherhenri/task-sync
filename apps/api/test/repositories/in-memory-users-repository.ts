import { DomainEvents } from '@/core/events/domain-events'
import type { UsersRepository } from '@/domain/auth/application/repositories/users-repository'
import type { User } from '@/domain/auth/enterprise/entities/user'

export class InMemoryUsersRepository implements UsersRepository {
  public items: Array<User> = []

  async findById(id: string): Promise<User | null> {
    return this.items.find((item) => item.id.toString() === id) ?? null
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.items.find((item) => item.email === email) ?? null
  }

  async create(user: User): Promise<void> {
    this.items.push(user)

    DomainEvents.dispatchEventsForAggregate(user.id)
  }

  async save(user: User): Promise<void> {
    const userIndex = this.items.findIndex((item) => item.id === user.id)

    this.items[userIndex] = user

    DomainEvents.dispatchEventsForAggregate(user.id)
  }
}
