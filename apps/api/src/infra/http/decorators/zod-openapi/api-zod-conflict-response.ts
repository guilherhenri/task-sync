/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiConflictResponse } from '@nestjs/swagger'

import { zodToOpenAPI } from '@/utils/zod-to-openapi'

import {
  conflictResponseSchema,
  generateConflictResponseExample,
} from '../../responses/conflict'

/**
 * A decorator that enhances an API endpoint with a conflict response schema using Zod and OpenAPI.
 * Configures a conflict response (HTTP 409) with a custom message and optional description.
 *
 * @param params - Configuration object for the decorator.
 * @param params.description - Optional. A description of the conflict response.
 * @param params.custom - An object containing a custom message for the conflict response.
 * @param params.custom.message - The custom message to include in the conflict response example.
 * @returns A decorator function that applies the configured OpenAPI schema to the API endpoint's conflict response.
 * @example
 * ```typescript
 * @ApiZodConflictResponse({
 *   description: "Conflict due to duplicate resource",
 *   custom: { message: "Resource already exists" },
 * })
 * async createResource() {
 *   // Method implementation
 * }
 * ```
 */
export function ApiZodConflictResponse({
  description,
  custom: { message },
}: {
  description?: string
  custom: {
    message: string
  }
}) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const openApiSchema = zodToOpenAPI(conflictResponseSchema, false)
    openApiSchema.example = generateConflictResponseExample(message)

    const decorator = ApiConflictResponse({
      description,
      schema: openApiSchema,
    })

    return decorator(target, propertyKey, descriptor)
  }
}
