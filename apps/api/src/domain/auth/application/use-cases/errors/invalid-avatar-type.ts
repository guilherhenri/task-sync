import { UseCaseError } from '@/core/errors/use-case-error'

export class InvalidAvatarTypeError extends Error implements UseCaseError {
  constructor(type: string) {
    super(`Tipo de arquivo inválido: ${type}`)
  }
}
