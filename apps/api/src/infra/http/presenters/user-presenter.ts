import type { User } from '@/domain/auth/enterprise/entities/user'

export class UserPresenter {
  static toHTTP(user: User) {
    return {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      avatar_url: user.avatarUrl,
      created_at: user.createdAt,
    }
  }
}
