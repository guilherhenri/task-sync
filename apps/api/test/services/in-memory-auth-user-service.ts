import type { UsersRepository } from '@/domain/auth/application/repositories/users-repository'
import type {
  AuthUser,
  AuthUserService,
} from '@/domain/auth/application/services/auth-user-service'

export class InMemoryAuthUserService implements AuthUserService {
  constructor(private usersRepository: UsersRepository) {}

  async getUserForEmailDelivery(id: string): Promise<AuthUser | null> {
    const user = await this.usersRepository.findById(id)

    if (!user) {
      return null
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
    }
  }
}
