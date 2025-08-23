/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiBadRequestResponse } from '@nestjs/swagger'

import { zodToOpenAPI } from '@/utils/zod-to-openapi'

import {
  generateValidationFailedResponseExample,
  validationFailedResponseSchema,
} from '../../responses/validation-failed'
import type { OpenApiDecoratorConfig } from '../types'

/**
 * Creates a configuration object for a validation failed response using Zod and OpenAPI.
 * Generates an OpenAPI schema with an example based on the provided custom field and message.
 *
 * @param options - Configuration object for the validation failed response.
 * @param options.description - Optional. A description of the validation failed response.
 * @param options.custom - An object containing the field and message for the validation error.
 * @param options.custom.field - The name of the field that failed validation.
 * @param options.custom.message - The error message associated with the validation failure.
 * @returns An OpenAPI decorator configuration object with the schema and description.
 * @example
 * ```typescript
 * const config = createApiZodValidationFailedResponseConfig({
 *   description: "Invalid input data",
 *   custom: { field: "email", message: "Invalid email format" },
 * });
 * ```
 */
export function createApiZodValidationFailedResponseConfig({
  description,
  custom,
}: {
  description?: string
  custom: { field: string; message: string }
}): OpenApiDecoratorConfig {
  const openApiSchema = zodToOpenAPI(validationFailedResponseSchema)
  openApiSchema.example = generateValidationFailedResponseExample(custom)

  return {
    description,
    schema: openApiSchema,
  }
}

/**
 * A decorator that enhances an API endpoint with a validation failed response schema using Zod and OpenAPI.
 * Configures a bad request response (HTTP 400) with a custom field and message for validation errors.
 *
 * @param options - Configuration object for the decorator.
 * @param options.description - Optional. A description of the validation failed response.
 * @param options.custom - An object containing the field and message for the validation error.
 * @param options.custom.field - The name of the field that failed validation.
 * @param options.custom.message - The error message associated with the validation failure.
 * @returns A decorator function that applies the configured OpenAPI schema to the API endpoint's bad request response.
 * @example
 * ```typescript
 * @ApiZodValidationFailedResponse({
 *   description: "Validation error on input data",
 *   custom: { field: "email", message: "Invalid email format" },
 * })
 * async createUser() {
 *   // Method implementation
 * }
 * ```
 */
export function ApiZodValidationFailedResponse(options: {
  description?: string
  custom: {
    field: string
    message: string
  }
}) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const config = createApiZodValidationFailedResponseConfig(options)

    const decorator = ApiBadRequestResponse(config)

    return decorator(target, propertyKey, descriptor)
  }
}
