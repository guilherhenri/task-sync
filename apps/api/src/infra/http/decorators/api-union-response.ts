/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiResponse } from '@nestjs/swagger'

import type { OpenApiDecoratorConfig } from './types'

/**
 * Creates a decorator that combines multiple OpenAPI response schemas using oneOf.
 * This allows documenting endpoints that can return different response formats
 * for the same HTTP status code.
 *
 * @param statusCode - The HTTP status code for the response
 * @param configs - Array of OpenAPI decorator configurations to combine
 * @param unionDescription - Optional custom description for the combined response.
 *                          If not provided, descriptions from configs will be joined with ' | '
 *
 * @returns A NestJS method decorator that applies the combined response documentation
 *
 * @example
 * ```typescript
 * @ApiUnionResponse(400, [
 *   createValidationErrorConfig({ message: 'Invalid email' }),
 *   createAuthErrorConfig({ message: 'Email not verified' })
 * ], 'Bad Request - Validation or Authentication Error')
 * @Post('/login')
 * login() {
 *   // method implementation
 * }
 * ```
 */
export function ApiUnionResponse(
  statusCode: number,
  configs: Array<OpenApiDecoratorConfig>,
  unionDescription?: string,
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const unionSchema = {
      oneOf: configs.map((config) => config.schema),
      examples: configs.reduce(
        (acc, config, index) => {
          if (config.schema.example) {
            acc[`example_${index + 1}`] = {
              summary: config.description || `Example ${index + 1}`,
              value: config.schema.example,
            }
          }
          return acc
        },
        {} as Record<string, { summary: string; value: any }>,
      ),
    }

    const decorator = ApiResponse({
      status: statusCode,
      description:
        unionDescription ||
        configs
          .map((c) => c.description)
          .filter(Boolean)
          .join(' | '),
      schema: unionSchema,
    })

    return decorator(target, propertyKey, descriptor)
  }
}
