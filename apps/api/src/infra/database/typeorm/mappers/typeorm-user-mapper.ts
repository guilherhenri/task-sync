import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { User } from '@/domain/auth/enterprise/entities/user'
import { PasswordHash } from '@/domain/auth/enterprise/entities/value-objects/password-hash'

import type { User as TypeOrmUser } from '../entities/user.entity'

export class TypeOrmUserMapper {
  static async toDomain(raw: TypeOrmUser): Promise<User> {
    return await User.create(
      {
        name: raw.name,
        email: raw.email,
        avatarUrl: raw.avatarUrl,
        passwordHash: await PasswordHash.create(raw.passwordHash, true),
      },
      new UniqueEntityID(raw.id),
    )
  }

  static toTypeOrm(raw: User): TypeOrmUser {
    return {
      id: raw.id.toString(),
      name: raw.name,
      email: raw.email,
      passwordHash: raw.passwordHash.value,
      avatarUrl: raw.avatarUrl,
      emailVerified: raw.emailVerified,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    }
  }
}
