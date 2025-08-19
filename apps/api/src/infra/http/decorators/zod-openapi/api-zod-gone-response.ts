/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiGoneResponse } from '@nestjs/swagger'

import { zodToOpenAPI } from '@/utils/zod-to-openapi'

import { conflictResponseSchema } from '../../responses/conflict'
import { generateGoneResponseExample } from '../../responses/gone'

/**
 * A decorator that enhances an API endpoint with a gone response schema using Zod and OpenAPI.
 * Configures a gone response (HTTP 410) with a custom message and optional description.
 *
 * @param params - Configuration object for the decorator.
 * @param params.description - Optional. A description of the gone response.
 * @param params.custom - An object containing a custom message for the gone response.
 * @param params.custom.message - The custom message to include in the gone response example.
 * @returns A decorator function that applies the configured OpenAPI schema to the API endpoint's gone response.
 * @example
 * ```typescript
 * @ApiZodGoneResponse({
 *   description: "Resource no longer available",
 *   custom: { message: "The requested resource has been permanently removed" },
 * })
 * async getResource() {
 *   // Method implementation
 * }
 * ```
 */
export function ApiZodGoneResponse({
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
    openApiSchema.example = generateGoneResponseExample(message)

    const decorator = ApiGoneResponse({
      description,
      schema: openApiSchema,
    })

    return decorator(target, propertyKey, descriptor)
  }
}
