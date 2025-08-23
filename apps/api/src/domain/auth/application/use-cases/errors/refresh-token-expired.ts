import { UseCaseError } from '@/core/errors/use-case-error'

export class RefreshTokenExpiredError extends Error implements UseCaseError {
  constructor() {
    super('Refresh token expirado ou inválido.')
  }
}
