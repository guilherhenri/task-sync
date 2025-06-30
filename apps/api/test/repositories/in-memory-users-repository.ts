import type { UsersRepository } from '@/domain/auth/application/repositories/users-repository'
import type { User } from '@/domain/auth/enterprise/entities/user'

export class InMemoryUsersRepository implements UsersRepository {
  public items: Array<User> = []

  async findByEmail(email: string): Promise<User | null> {
    return this.items.find((item) => item.email === email) ?? null
  }

  async create(user: User): Promise<void> {
    this.items.push(user)
  }
}
