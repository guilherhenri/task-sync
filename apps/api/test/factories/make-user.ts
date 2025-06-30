import { faker } from '@faker-js/faker'

import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { User, type UserProps } from '@/domain/auth/enterprise/entities/user'

export async function makeUser(
  override: Partial<
    Omit<
      UserProps & {
        password: string
      },
      'passwordHash'
    >
  > = {},
  id?: UniqueEntityID,
) {
  const user = await User.create(
    {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: '123456',
      avatarUrl: faker.image.avatar(),
      ...override,
    },
    id,
  )

  return user
}
