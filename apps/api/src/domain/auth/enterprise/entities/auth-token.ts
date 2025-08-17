import { Entity } from '@/core/entities/entity'
import type { UniqueEntityID } from '@/core/entities/unique-entity-id'
import type { Optional } from '@/core/types/optional'

export interface AuthTokenProps {
  userId: UniqueEntityID
  refreshToken: string
  expiresAt: Date
  createdAt: Date
}

export class AuthToken extends Entity<AuthTokenProps> {
  get userId() {
    return this.props.userId
  }

  get refreshToken() {
    return this.props.refreshToken
  }

  get expiresAt() {
    return this.props.expiresAt
  }

  get createdAt() {
    return this.props.createdAt
  }

  /**
   * Verifies if the refresh token is expired.
   * @returns True if the refresh token is expired, false otherwise.
   */
  isExpired() {
    return new Date() > this.props.expiresAt
  }

  static create(
    props: Optional<AuthTokenProps, 'createdAt'>,
    id?: UniqueEntityID,
  ) {
    const authToken = new AuthToken(
      {
        ...props,
        createdAt: new Date(),
      },
      id,
    )

    return authToken
  }
}
