import { AggregateRoot } from '@/core/entities/aggregate-root'
import type { UniqueEntityID } from '@/core/entities/unique-entity-id'
import type { Optional } from '@/core/types/optional'

import { PasswordResetEvent } from '../events/password-reset-event'
import { UserRegisteredEvent } from '../events/user-registered-event'
import { PasswordHash } from './value-objects/password-hash'

export interface UserProps {
  name: string
  email: string
  passwordHash: PasswordHash
  avatarUrl: string | null
  emailVerified: boolean
  createdAt: Date
  updatedAt?: Date
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

  /**
   * Gets the user's password hash.
   * @returns The PasswordHash instance.
   */
  get passwordHash() {
    return this.props.passwordHash
  }

  /**
   * Updates the user's password hash.
   * @param passwordHash - The new PasswordHash instance.
   */
  set passwordHash(passwordHash: PasswordHash) {
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
   * Verifies if a plaintext password matches the stored hash.
   * @param password {string} - The plaintext password to verify.
   * @returns A Promise resolving to true if the password matches, false otherwise.
   */
  public async verifyPassword(password: string) {
    return this.passwordHash.verify(password)
  }

  /**
   * Resets the user's password by generating a new password hash and emitting a PasswordResetEvent.
   * @param newPassword - The new plaintext password to be hashed and set.
   * @returns A Promise that resolves when the password has been successfully reset.
   */
  public async resetPassword(newPassword: string) {
    const newPasswordHash = await PasswordHash.create(newPassword)

    this.props.passwordHash = newPasswordHash
    this.touch()

    this.addDomainEvent(new PasswordResetEvent(this))
  }

  protected touch() {
    this.props.updatedAt = new Date()
  }

  static async create(
    props: Optional<
      Omit<UserProps, 'passwordHash' | 'emailVerified'>,
      'avatarUrl' | 'createdAt'
    > & {
      password: string
    },
    id?: UniqueEntityID,
  ) {
    const user = new User(
      {
        ...props,
        passwordHash: await PasswordHash.create(props.password),
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
