import { compare, hash } from 'bcryptjs'

export class PasswordHash {
  public value: string

  private constructor(value: string) {
    this.value = value
  }

  /**
   * Creates a PasswordHash instance from a plaintext password.
   * @param plaintext {string} The plaintext password to hash.
   * @returns A Promise resolving to a PasswordHash instance.
   */
  public static async create(plaintext: string) {
    const hashedPassword = await this.hashPassword(plaintext)

    return new PasswordHash(hashedPassword)
  }

  /**
   * Verifies if a plaintext password matches the stored hash.
   * @param plaintext {string} The plaintext password to verify.
   * @returns A Promise resolving to true if the password matches, false otherwise.
   */
  public async verify(plaintext: string) {
    return compare(plaintext, this.value)
  }

  /**
   * Hashes a plaintext password using bcrypt with configured salt rounds.
   * @param plaintext {string} The plaintext password to hash.
   * @returns A Promise resolving to the hashed password string.
   * @private
   */
  private static async hashPassword(plaintext: string) {
    return hash(plaintext, 12)
  }
}
