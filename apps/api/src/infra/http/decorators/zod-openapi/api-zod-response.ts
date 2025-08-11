/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiResponse } from '@nestjs/swagger'
import type { ZodType } from 'zod/v4'

import { zodToOpenAPI } from '@/utils/zod-to-openapi'

/**
 * A decorator that enhances an API endpoint with a response schema using Zod and OpenAPI.
 * Converts a Zod schema to an OpenAPI schema for a specified HTTP response status, optionally adding a description and example data.
 *
 * @param params - Configuration object for the decorator.
 * @param params.status - The HTTP status code for the response.
 * @param params.schema - The Zod schema object defining the structure of the response.
 * @param params.description - Optional. A description of the response.
 * @param params.examples - Optional. An object containing example data for the schema, where keys are example names and values are example data.
 * @returns A decorator function that applies the configured OpenAPI schema to the API endpoint's response.
 * @example
 * ```typescript
 * const responseSchema = z.object({
 *   id: z.string(),
 *   name: z.string(),
 * });
 *
 * @ApiZodResponse({
 *   status: 200,
 *   schema: responseSchema,
 *   description: "Successful response with user data",
 *   examples: { example1: { id: "123", name: "John Doe" } },
 * })
 * async getUser() {
 *   // Method implementation
 * }
 * ```
 */
export function ApiZodResponse({
  status,
  schema,
  description,
  examples,
}: {
  status: number
  schema: ZodType
  description?: string
  examples?: Record<string, any>
}) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const openApiSchema = zodToOpenAPI(schema)

    if (examples) openApiSchema.example = examples

    const decorator = ApiResponse({
      status,
      description,
      schema: openApiSchema,
    })

    return decorator(target, propertyKey, descriptor)
  }
}
