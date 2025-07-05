import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import {
  VerificationToken,
  type VerificationTokenProps,
} from '@/domain/auth/enterprise/entities/verification-token'

export function makeVerificationToken(
  override: Partial<Omit<VerificationTokenProps, 'token' | 'tokenHash'>> = {},
  id?: UniqueEntityID,
) {
  const verificationToken = VerificationToken.create(
    {
      userId: new UniqueEntityID(),
      type: 'email:verify',
      ...override,
    },
    id,
  )

  return verificationToken
}
