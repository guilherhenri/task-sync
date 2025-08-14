import { UseCaseError } from '@/core/errors/use-case-error'

export class EmailAlreadyInUseError extends Error implements UseCaseError {
  constructor(identifier: string) {
    super(`O e-mail "${identifier}" já está em uso.`)
  }
}
