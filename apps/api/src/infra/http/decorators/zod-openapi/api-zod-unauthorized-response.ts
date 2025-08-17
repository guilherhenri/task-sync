/* eslint-disable @typescript-eslint/no-explicit-any */

import { ApiUnauthorizedResponse } from '@nestjs/swagger'

import { zodToOpenAPI } from '@/utils/zod-to-openapi'

import { conflictResponseSchema } from '../../responses/conflict'
import { generateUnauthorizedResponseExample } from '../../responses/unauthorized'

/**
 * A decorator that enhances an API endpoint with an unauthorized response schema using Zod and OpenAPI.
 * Configures an unauthorized response (HTTP 401) with a custom message and optional description.
 *
 * @param params - Configuration object for the decorator.
 * @param params.description - Optional. A description of the unauthorized response.
 * @param params.custom - An object containing a custom message for the unauthorized response.
 * @param params.custom.message - The custom message to include in the unauthorized response example.
 * @returns A decorator function that applies the configured OpenAPI schema to the API endpoint's unauthorized response.
 * @example
 * ```typescript
 * @ApiZodUnauthorizedResponse({
 *   description: "Unauthorized access attempt",
 *   custom: { message: "Invalid or missing authentication token" },
 * })
 * async accessResource() {
 *   // Method implementation
 * }
 * ```
 */
export function ApiZodUnauthorizedResponse({
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
    openApiSchema.example = generateUnauthorizedResponseExample(message)

    const decorator = ApiUnauthorizedResponse({
      description,
      schema: openApiSchema,
    })

    return decorator(target, propertyKey, descriptor)
  }
}
