import { Injectable } from '@nestjs/common'

import { UsersRepository } from '@/domain/auth/application/repositories/users-repository'
import {
  type AuthUser,
  AuthUserService,
} from '@/domain/auth/application/services/auth-user-service'

@Injectable()
export class InfraAuthUserService implements AuthUserService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async getUserForEmailDelivery(id: string): Promise<AuthUser | null> {
    const user = await this.usersRepository.findById(id)

    if (!user) return null

    return {
      id: user.id,
      name: user.name,
      email: user.email,
    }
  }
}
