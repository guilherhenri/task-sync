/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from 'zod/v4'

import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'

export interface OpenAPISchema {
  type?: string
  format?: string
  description?: string
  minLength?: number
  maxLength?: number
  minimum?: number
  maximum?: number
  pattern?: string
  required?: Array<string>
  properties?: Record<string, OpenAPISchema>
  items?: OpenAPISchema
  enum?: Array<any>
  nullable?: boolean
  example?: any
}

/**
 * Generates realistic examples based on the schema type
 */
function generateExample(schema: z.ZodType): unknown {
  if (schema instanceof z.ZodObject) {
    const shape = schema.shape
    const example: Record<string, unknown> = {}

    for (const [key, value] of Object.entries(shape)) {
      example[key] = generateExample(value as z.ZodType)
    }

    return example
  }

  if (schema instanceof z.ZodString) {
    return 'string'
  }

  if (schema instanceof z.ZodEmail) {
    return 'user@example.com'
  }

  if (schema instanceof z.ZodURL) {
    return 'https://example.com'
  }

  if (schema instanceof z.ZodUUID) {
    return '550e8400-e29b-41d4-a716-446655440000'
  }

  if (schema instanceof z.ZodDate) {
    return '2023-01-01T00:00:00.000Z'
  }

  if (schema instanceof z.ZodNumber) {
    return 123.45
  }

  if (schema instanceof z.ZodBoolean) {
    return true
  }

  if (schema instanceof z.ZodArray) {
    const itemExample = generateExample((schema as any)._def.type)
    return [itemExample]
  }

  if (schema instanceof z.ZodEnum) {
    const values = schema.def.entries
    return values[0]
  }

  if (schema instanceof z.ZodLiteral) {
    return schema.def.values[0]
  }

  if (schema instanceof z.ZodOptional) {
    return generateExample((schema as any)._def.innerType)
  }

  if (schema instanceof z.ZodNullable) {
    return generateExample((schema as any)._def.innerType)
  }

  return 'example'
}

/**
 * Converts a basic ZodSchema to OpenAPI Schema
 * Works with primitive types and simple objects
 */
export function zodToOpenAPI(
  schema: z.ZodType,
  includeExamples: boolean = true,
): OpenAPISchema {
  const description = schema.description

  if (schema instanceof z.ZodObject) {
    const shape = schema.shape
    const properties: Record<string, OpenAPISchema> = {}
    const required: string[] = []

    for (const [key, value] of Object.entries(shape)) {
      properties[key] = zodToOpenAPI(value as z.ZodType, includeExamples)

      if (!(value instanceof z.ZodOptional)) {
        required.push(key)
      }
    }

    const result: OpenAPISchema = {
      type: 'object',
      properties,
      required: required.length > 0 ? required : undefined,
    }

    if (description) result.description = description
    if (includeExamples) result.example = generateExample(schema)

    return result
  }

  if (schema instanceof z.ZodString) {
    const checks = (schema as any)._def.checks || []
    const openApiSchema: OpenAPISchema = { type: 'string' }

    for (const check of checks) {
      switch (check.kind) {
        case 'min':
          openApiSchema.minLength = check.value
          break
        case 'max':
          openApiSchema.maxLength = check.value
          break
        case 'email':
          openApiSchema.format = 'email'
          if (includeExamples) openApiSchema.example = 'user@example.com'
          break
        case 'regex':
          openApiSchema.pattern = check.regex.source
          break
      }
    }

    if (description) openApiSchema.description = description
    if (includeExamples && !openApiSchema.example) {
      openApiSchema.example = 'string'
    }

    return openApiSchema
  }

  if (schema instanceof z.ZodNumber) {
    const checks = (schema as any)._def.checks || []
    const openApiSchema: OpenAPISchema = { type: 'number' }

    for (const check of checks) {
      switch (check.kind) {
        case 'min':
          openApiSchema.minimum = check.value
          break
        case 'max':
          openApiSchema.maximum = check.value
          break
        case 'int':
          openApiSchema.type = 'integer'
          if (includeExamples) openApiSchema.example = 123
          break
      }
    }

    if (description) openApiSchema.description = description
    if (includeExamples && !openApiSchema.example) {
      openApiSchema.example = openApiSchema.type === 'integer' ? 123 : 123.45
    }

    return openApiSchema
  }

  if (schema instanceof z.ZodBoolean) {
    const result: OpenAPISchema = { type: 'boolean' }

    if (description) result.description = description
    if (includeExamples) result.example = true

    return result
  }

  if (schema instanceof z.ZodArray) {
    const items = zodToOpenAPI((schema as any).def.element, includeExamples)
    const result: OpenAPISchema = {
      type: 'array',
      items,
    }

    if (description) result.description = description
    if (includeExamples) {
      result.example = [
        items.example ?? generateExample((schema as any).def.type),
      ]
    }
    return result
  }

  if (schema instanceof z.ZodEnum) {
    const values = (schema as any)._def.entries
    const result: OpenAPISchema = {
      type: 'string',
      enum: values,
    }
    if (description) result.description = description
    if (includeExamples) result.example = values[0]
    return result
  }

  if (schema instanceof z.ZodLiteral) {
    const values = (schema as any)._def.values
    const result: OpenAPISchema = {
      type: typeof values[0],
      enum: values,
    }

    if (description) result.description = description
    if (includeExamples) result.example = values

    return result
  }

  if (schema instanceof z.ZodOptional) {
    const innerSchema = zodToOpenAPI(
      (schema as any)._def.innerType,
      includeExamples,
    )

    return { ...innerSchema, nullable: true }
  }

  if (schema instanceof z.ZodNullable) {
    const innerSchema = zodToOpenAPI(
      (schema as any)._def.innerType,
      includeExamples,
    )

    return { ...innerSchema, nullable: true }
  }

  if (schema instanceof z.ZodCustom) {
    const def = (schema as any)._def

    const mainFnStr = def.fn?.toString() || ''
    const isFileFromMain =
      mainFnStr.includes('File') || mainFnStr.includes('instanceof')

    const isFileFromChecks = def.checks?.some((check: any) => {
      const checkStr = check.fn?.toString() || check.toString() || ''
      return checkStr.includes('file.type') || checkStr.includes('validTypes')
    })

    const isFileSchema = isFileFromMain || isFileFromChecks

    if (isFileSchema) {
      const result: OpenAPISchema = {
        type: 'string',
        format: 'binary',
      }

      if (description) result.description = description

      return result
    }

    const result: OpenAPISchema = { type: 'string' }

    if (description) result.description = description
    if (includeExamples) result.example = 'custom'

    return result
  }

  const result: OpenAPISchema = { type: 'string' }
  if (description) result.description = description
  if (includeExamples) result.example = 'string'

  return result
}

/**
 * Class for creating schemas more fluently
 */
export class ZodSwaggerBuilder {
  private schema: z.ZodObject<any>

  constructor(schema: z.ZodObject<any>) {
    this.schema = schema
  }

  static from(schema: z.ZodObject<any>) {
    return new ZodSwaggerBuilder(schema)
  }

  toOpenAPI(includeExamples: boolean = true): OpenAPISchema {
    return zodToOpenAPI(this.schema, includeExamples)
  }

  /**
   * Adds custom descriptions for specific fields
   */
  withDescriptions(
    descriptions: Record<string, string>,
    includeExamples: boolean = true,
  ): OpenAPISchema {
    const openApiSchema = zodToOpenAPI(this.schema, includeExamples)

    if (openApiSchema.properties) {
      for (const [key, description] of Object.entries(descriptions)) {
        if (openApiSchema.properties[key]) {
          openApiSchema.properties[key].description = description
        }
      }
    }

    return openApiSchema
  }
}

// export const createApiSchemas = <T extends z.ZodObject<any>>(
//   zodSchema: T,
//   descriptions?: Record<string, string>,
//   includeExamples: boolean = true,
// ) => {
//   const baseSchema = zodToOpenAPI(zodSchema, includeExamples)

//   if (descriptions && baseSchema.properties) {
//     for (const [key, description] of Object.entries(descriptions)) {
//       if (baseSchema.properties[key]) {
//         baseSchema.properties[key].description = description
//       }
//     }
//   }

//   return {
//     zodSchema,
//     openApiSchema: baseSchema,
//     validationPipe: new ZodValidationPipe(zodSchema),
//   }
// }

/**
 * Specific function to create custom examples
 */
export function createApiSchemas<T extends z.ZodObject<any>>(
  zodSchema: T,
  customExamples?: Record<string, any>,
  descriptions?: Record<string, string>,
) {
  const baseSchema = zodToOpenAPI(zodSchema, !customExamples)

  if (customExamples) baseSchema.example = customExamples

  if (descriptions && baseSchema.properties) {
    for (const [key, description] of Object.entries(descriptions)) {
      if (baseSchema.properties[key]) {
        baseSchema.properties[key].description = description
      }
    }
  }

  return {
    zodSchema,
    openApiSchema: baseSchema,
    validationPipe: new ZodValidationPipe(zodSchema),
  }
}
