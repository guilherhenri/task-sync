/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiBody } from '@nestjs/swagger'
import type { ZodObject } from 'zod/v4'

import { zodToOpenAPI } from '@/utils/zod-to-openapi'

/**
 * A decorator that enhances an API endpoint with a request body schema using Zod and OpenAPI.
 * Converts a Zod schema to an OpenAPI schema, optionally adding examples and property descriptions.
 *
 * @param params - Configuration object for the decorator.
 * @param params.schema - The Zod schema object defining the structure of the request body.
 * @param params.examples - Optional. An object containing example data for the schema, where keys are example names and values are example data.
 * @param params.description - Optional. An object containing descriptions for schema properties, where keys are property names and values are their descriptions.
 * @returns A decorator function that applies the configured OpenAPI schema to the API endpoint.
 * @example
 * ```typescript
 * const userSchema = z.object({
 *   name: z.string(),
 *   age: z.number(),
 * });
 *
 * @ApiZodBody({
 *   schema: userSchema,
 *   examples: { example1: { name: "John", age: 30 } },
 *   description: { name: "User's full name", age: "User's age in years" },
 * })
 * async createUser(@Body() body: any) {
 *   // Method implementation
 * }
 * ```
 */
export function ApiZodBody({
  schema,
  examples,
  description,
}: {
  schema: ZodObject<any>
  examples?: Record<string, any>
  description?: Record<string, string>
}) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const openApiSchema = zodToOpenAPI(schema)

    if (examples) openApiSchema.example = examples

    if (description && openApiSchema.properties) {
      for (const [key, value] of Object.entries(description)) {
        if (openApiSchema.properties[key]) {
          openApiSchema.properties[key].description = value
        }
      }
    }

    const decorator = ApiBody({ schema: openApiSchema })

    return decorator(target, propertyKey, descriptor)
  }
}
