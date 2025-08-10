import { UseCaseError } from '@/core/errors/use-case-error'

export class ResourceInvalidError extends Error implements UseCaseError {}
