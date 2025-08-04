import type {
  TokenType,
  VerificationToken,
} from '../../enterprise/entities/verification-token'

export abstract class VerificationTokensRepository {
  abstract save(verificationToken: VerificationToken): Promise<void>
  abstract get(
    token: string,
    type: TokenType,
  ): Promise<VerificationToken | null>

  abstract delete(verificationToken: VerificationToken): Promise<void>
  abstract revokeTokensByUserId(userId: string): Promise<void>
}
