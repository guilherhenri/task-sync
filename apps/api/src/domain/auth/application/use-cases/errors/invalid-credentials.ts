import { UseCaseError } from '@/core/errors/use-case-error'

export class InvalidCredentialsError extends Error implements UseCaseError {
  constructor(message?: string) {
    super(message ?? 'E-mail ou senha inválidos.')
  }
}
