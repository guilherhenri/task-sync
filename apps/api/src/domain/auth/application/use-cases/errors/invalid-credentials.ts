import { UseCaseError } from '@/core/errors/use-case-error'

export class InvalidCredentialsError extends Error implements UseCaseError {
  constructor() {
    super('E-mail ou senha inválidos.')
  }
}
