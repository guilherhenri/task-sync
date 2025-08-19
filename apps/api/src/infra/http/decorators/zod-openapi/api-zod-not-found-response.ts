/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiNotFoundResponse } from '@nestjs/swagger'

import { zodToOpenAPI } from '@/utils/zod-to-openapi'

import { conflictResponseSchema } from '../../responses/conflict'
import { generateNotFoundResponseExample } from '../../responses/not-found'

/**
 * A decorator that enhances an API endpoint with a not found response schema using Zod and OpenAPI.
 * Configures a not found response (HTTP 404) with a custom message and optional description.
 *
 * @param params - Configuration object for the decorator.
 * @param params.description - Optional. A description of the not found response.
 * @param params.custom - An object containing a custom message for the not found response.
 * @param params.custom.message - The custom message to include in the not found response example.
 * @returns A decorator function that applies the configured OpenAPI schema to the API endpoint's not found response.
 * @example
 * ```typescript
 * @ApiZodNotFoundResponse({
 *   description: "Resource not found",
 *   custom: { message: "Requested resource does not exist" },
 * })
 * async getResource() {
 *   // Method implementation
 * }
 * ```
 */
export function ApiZodNotFoundResponse({
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
    openApiSchema.example = generateNotFoundResponseExample(message)

    const decorator = ApiNotFoundResponse({
      description,
      schema: openApiSchema,
    })

    return decorator(target, propertyKey, descriptor)
  }
}
