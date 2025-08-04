/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiResponse,
} from '@nestjs/swagger'
import type { ZodObject, ZodType } from 'zod/v4'

import {
  conflictResponseSchema,
  generateConflictResponseExample,
} from '@/infra/http/responses/conflict'
import {
  generateValidationFailedResponseExample,
  validationFailedResponseSchema,
} from '@/infra/http/responses/validation-failed'
import { zodToOpenAPI } from '@/utils/zod-to-openapi'

/**
 * Decorator factory to automate Swagger documentation
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

/**
 * Decorator factory for response schemas
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

/**
 * Decorator factory for conflict response schemas
 */
export function ApiZodConflictResponse({
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
    openApiSchema.example = generateConflictResponseExample(message)

    const decorator = ApiConflictResponse({
      description,
      schema: openApiSchema,
    })

    return decorator(target, propertyKey, descriptor)
  }
}

/**
 * Decorator factory for bad response schemas
 */
export function ApiZodBadResponse({
  description,
  custom,
}: {
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
    const openApiSchema = zodToOpenAPI(validationFailedResponseSchema)
    openApiSchema.example = generateValidationFailedResponseExample(custom)

    const decorator = ApiBadRequestResponse({
      description,
      schema: openApiSchema,
    })

    return decorator(target, propertyKey, descriptor)
  }
}
