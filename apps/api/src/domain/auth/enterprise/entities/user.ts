import { AggregateRoot } from '@/core/entities/aggregate-root'
import type { UniqueEntityID } from '@/core/entities/unique-entity-id'
import type { Optional } from '@/core/types/optional'

import { PasswordResetEvent } from '../events/password-reset-event'
import { UserRegisteredEvent } from '../events/user-registered-event'

export interface UserProps {
  name: string
  email: string
  passwordHash: string
  avatarUrl: string | null
  emailVerified: boolean
  createdAt: Date
  updatedAt?: Date | null
}

export class User extends AggregateRoot<UserProps> {
  get name() {
    return this.props.name
  }

  set name(name: string) {
    this.props.name = name
    this.touch()
  }

  get email() {
    return this.props.email
  }

  set email(email: string) {
    this.props.email = email
    this.touch()
  }

  get passwordHash() {
    return this.props.passwordHash
  }

  set passwordHash(passwordHash: string) {
    this.props.passwordHash = passwordHash
    this.touch()
  }

  get avatarUrl() {
    return this.props.avatarUrl
  }

  set avatarUrl(avatarUrl: string | null) {
    this.props.avatarUrl = avatarUrl
    this.touch()
  }

  get emailVerified() {
    return this.props.emailVerified
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  /**
   * Verifies the user's email.
   */
  public verifyEmail() {
    if (!this.props.emailVerified) {
      this.props.emailVerified = true
      this.touch()
    }
  }

  /**
   * Resets the user's passwordHash and emitting a PasswordResetEvent.
   * @param newPasswordHash - The new passwordHash to be set.
   * @returns A Promise that resolves when the password has been successfully reset.
   */
  public async resetPassword(newPasswordHash: string) {
    this.props.passwordHash = newPasswordHash
    this.touch()

    this.addDomainEvent(new PasswordResetEvent(this))
  }

  protected touch() {
    this.props.updatedAt = new Date()
  }

  static create(
    props: Optional<
      Omit<UserProps, 'emailVerified'>,
      'avatarUrl' | 'createdAt'
    >,
    id?: UniqueEntityID,
  ) {
    const user = new User(
      {
        ...props,
        passwordHash: props.passwordHash,
        avatarUrl: props.avatarUrl ?? null,
        emailVerified: false,
        createdAt: new Date(),
      },
      id,
    )

    const isNewUser = !id

    if (isNewUser) {
      user.addDomainEvent(new UserRegisteredEvent(user))
    }

    return user
  }
}
