import { UseCaseError } from '@/core/errors/use-case-error'

export class ResourceGoneUseError extends Error implements UseCaseError {}
