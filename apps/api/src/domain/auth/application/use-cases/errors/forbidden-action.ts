import { UseCaseError } from '@/core/errors/use-case-error'

export class ForbiddenActionError extends Error implements UseCaseError {}
