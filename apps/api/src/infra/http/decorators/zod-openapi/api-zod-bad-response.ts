/* eslint-disable @typescript-eslint/no-explicit-any */

import { ApiBadRequestResponse } from '@nestjs/swagger'

import { zodToOpenAPI } from '@/utils/zod-to-openapi'

import {
  badResponseSchema,
  generateBadResponseExample,
} from '../../responses/bad-response'
import type { OpenApiDecoratorConfig } from '../types'

/**
 * Creates a configuration object for a bad response using Zod and OpenAPI.
 * Generates an OpenAPI schema with an example based on the provided custom message.
 *
 * @param options - Configuration object for the bad response.
 * @param options.description - Optional. A description of the bad response.
 * @param options.custom - An object containing the custom message for the bad response.
 * @param options.custom.message - The custom message to include in the bad response example.
 * @returns An OpenAPI decorator configuration object with the schema and description.
 * @example
 * ```typescript
 * const config = createApiZodBadResponseConfig({
 *   description: "Invalid request data",
 *   custom: { message: "Request contains invalid parameters" },
 * });
 * ```
 */
export function createApiZodBadResponseConfig({
  description,
  custom,
}: {
  description?: string
  custom: { message: string }
}): OpenApiDecoratorConfig {
  const openApiSchema = zodToOpenAPI(badResponseSchema)
  openApiSchema.example = generateBadResponseExample(custom)

  return {
    description,
    schema: openApiSchema,
  }
}

/**
 * A decorator that enhances an API endpoint with a bad response schema using Zod and OpenAPI.
 * Configures a bad request response (HTTP 400) with a custom message and optional description.
 *
 * @param options - Configuration object for the decorator.
 * @param options.description - Optional. A description of the bad response.
 * @param options.custom - An object containing the custom message for the bad response.
 * @param options.custom.message - The custom message to include in the bad response example.
 * @returns A decorator function that applies the configured OpenAPI schema to the API endpoint's bad request response.
 * @example
 * ```typescript
 * @ApiZodBadResponse({
 *   description: "Bad request error",
 *   custom: { message: "Invalid input parameters" },
 * })
 * async processRequest() {
 *   // Method implementation
 * }
 * ```
 */
export function ApiZodBadResponse(options: {
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
    const config = createApiZodBadResponseConfig(options)

    const decorator = ApiBadRequestResponse(config)

    return decorator(target, propertyKey, descriptor)
  }
}
