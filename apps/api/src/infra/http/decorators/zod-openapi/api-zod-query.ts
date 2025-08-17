/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiQuery } from '@nestjs/swagger'
import type { ZodObject } from 'zod/v4'

import { zodToOpenAPI } from '@/utils/zod-to-openapi'

/**
 * A decorator that enhances an API endpoint with a query parameter schema using Zod and OpenAPI.
 * Converts a Zod schema to an OpenAPI schema for a specified query parameter, optionally adding examples and property descriptions.
 *
 * @param params - Configuration object for the decorator.
 * @param params.name - The name of the query parameter.
 * @param params.schema - The Zod schema object defining the structure of the query parameter.
 * @param params.examples - Optional. An object containing example data for the schema, where keys are example names and values are example data.
 * @param params.description - Optional. An object containing descriptions for schema properties, where keys are property names and values are their descriptions.
 * @returns A decorator function that applies the configured OpenAPI schema to the API endpoint's query parameter.
 * @example
 * ```typescript
 * const querySchema = z.object({
 *   id: z.string(),
 *   limit: z.number(),
 * });
 *
 * @ApiZodQuery({
 *   name: "query",
 *   schema: querySchema,
 *   examples: { example1: { id: "123", limit: 10 } },
 *   description: { id: "Unique identifier", limit: "Maximum number of results" },
 * })
 * async getData(@Query() query: any) {
 *   // Method implementation
 * }
 * ```
 */
export function ApiZodQuery({
  name,
  schema,
  examples,
  description,
}: {
  name: string
  schema: ZodObject<any>
  examples?: Record<string, any>
  description?: Record<string, string>
}) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const openApiSchema = zodToOpenAPI(schema, !examples)

    if (examples) openApiSchema.example = examples

    if (description && openApiSchema.properties) {
      for (const [key, value] of Object.entries(description)) {
        if (openApiSchema.properties[key]) {
          openApiSchema.properties[key].description = value
        }
      }
    }

    const decorator = ApiQuery({
      name,
      schema: openApiSchema,
    })

    return decorator(target, propertyKey, descriptor)
  }
}
