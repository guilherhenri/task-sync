import { faker } from '@faker-js/faker'
import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import cookieSignature from 'cookie-signature'

import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { User, type UserProps } from '@/domain/auth/enterprise/entities/user'
import { User as TypeOrmUser } from '@/infra/database/typeorm/entities/user.entity'
import { TypeOrmUserMapper } from '@/infra/database/typeorm/mappers/typeorm-user-mapper'
import { TypeOrmService } from '@/infra/database/typeorm/typeorm.service'
import { EnvService } from '@/infra/env/env.service'

export function makeUser(
  override: Partial<UserProps> = {},
  id?: UniqueEntityID,
) {
  const user = User.create(
    {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      passwordHash: faker.internet.password(),
      avatarUrl: faker.image.avatar(),
      ...override,
    },
    id,
  )

  return user
}

@Injectable()
export class UserFactory {
  constructor(private readonly typeorm: TypeOrmService) {}

  async makeTypeOrmUser(data: Partial<UserProps> = {}): Promise<User> {
    const user = makeUser(data)

    await this.typeorm
      .getRepository(TypeOrmUser)
      .save(TypeOrmUserMapper.toTypeOrm(user))

    return user
  }
}

@Injectable()
export class AuthenticateUserFactory {
  constructor(
    private readonly typeorm: TypeOrmService,
    private readonly jwt: JwtService,
    private readonly config: EnvService,
  ) {}

  async makeAuthenticatedUser(
    data: Partial<UserProps> = {},
  ): Promise<{ user: User; signedCookie: string }> {
    const user = makeUser(data)

    await this.typeorm
      .getRepository(TypeOrmUser)
      .save(TypeOrmUserMapper.toTypeOrm(user))

    const accessToken = this.jwt.sign({ sub: user.id.toString() })

    const signedValue = cookieSignature.sign(
      accessToken,
      this.config.get('COOKIE_SECRET'),
    )
    const signedCookie = `accessToken=s:${signedValue}`

    return { user, signedCookie }
  }
}
