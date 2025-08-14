/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiUnsupportedMediaTypeResponse } from '@nestjs/swagger'

import { zodToOpenAPI } from '@/utils/zod-to-openapi'

import {
  generateUnsupportedMediaTypeResponseExample,
  unsupportedMediaTypeResponseSchema,
} from '../../responses/unsupported-media-type'

/**
 * Creates a decorator for an HTTP 415 Unsupported Media Type response using Zod and OpenAPI.
 * Generates an OpenAPI schema with an example for the unsupported media type response.
 *
 * @param options - Configuration object for the unsupported media type response.
 * @param options.description - Optional. A description of the unsupported media type response.
 * @returns A decorator function that applies the OpenAPI schema and description to the target method.
 * @example
 * ```typescript
 * @ApiZodUnsupportedMediaTypeResponse({
 *   description: "Unsupported media type provided",
 * })
 * async myMethod() {
 *   // Method implementation
 * }
 * ```
 */
export function ApiZodUnsupportedMediaTypeResponse(options: {
  description?: string
}) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const openApiSchema = zodToOpenAPI(
      unsupportedMediaTypeResponseSchema,
      false,
    )
    openApiSchema.example = generateUnsupportedMediaTypeResponseExample()

    const decorator = ApiUnsupportedMediaTypeResponse({
      description: options.description,
      schema: openApiSchema,
    })

    return decorator(target, propertyKey, descriptor)
  }
}
