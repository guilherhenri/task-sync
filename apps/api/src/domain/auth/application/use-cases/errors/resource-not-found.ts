import { UseCaseError } from '@/core/errors/use-case-error'

export class ResourceNotFoundUseError extends Error implements UseCaseError {}
