import { UseCaseError } from '@/core/errors/use-case-error'

export class ResourceInvalidUseError extends Error implements UseCaseError {}
