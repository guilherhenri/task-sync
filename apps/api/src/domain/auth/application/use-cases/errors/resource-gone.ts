import { UseCaseError } from '@/core/errors/use-case-error'

export class ResourceGoneError extends Error implements UseCaseError {}
