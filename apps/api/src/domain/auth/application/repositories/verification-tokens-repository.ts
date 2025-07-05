import type {
  TokenType,
  VerificationToken,
} from '../../enterprise/entities/verification-token'

export interface VerificationTokensRepository {
  save(verificationToken: VerificationToken): Promise<void>
  get(token: string, type: TokenType): Promise<VerificationToken | null>
  delete(verificationToken: VerificationToken): Promise<void>
  revokeTokensByUserId(userId: string): Promise<void>
}
