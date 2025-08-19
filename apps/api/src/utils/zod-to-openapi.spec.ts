import { z } from 'zod/v4'

import { zodToOpenAPI } from './zod-to-openapi'

describe('zodToOpenAPI', () => {
  describe('ZodString', () => {
    it('should convert basic string schema', () => {
      const schema = z.string()
      const result = zodToOpenAPI(schema)

      expect(result).toEqual({
        type: 'string',
        example: 'string',
      })
    })

    it('should not include examples when includeExamples is false', () => {
      const schema = z.string()
      const result = zodToOpenAPI(schema, false)

      expect(result).toEqual({
        type: 'string',
      })
    })
  })

  describe('ZodNumber', () => {
    it('should convert basic number schema', () => {
      const schema = z.number()
      const result = zodToOpenAPI(schema)

      expect(result).toEqual({
        type: 'number',
        example: 123.45,
      })
    })
  })

  describe('ZodBoolean', () => {
    it('should convert boolean schema', () => {
      const schema = z.boolean()
      const result = zodToOpenAPI(schema)

      expect(result).toEqual({
        type: 'boolean',
        example: true,
      })
    })
  })

  describe('ZodArray', () => {
    it('should convert string array schema', () => {
      const schema = z.array(z.string())
      const result = zodToOpenAPI(schema)

      expect(result).toEqual({
        type: 'array',
        items: {
          type: 'string',
          example: 'string',
        },
        example: ['string'],
      })
    })

    it('should convert number array schema', () => {
      const schema = z.array(z.number())
      const result = zodToOpenAPI(schema)

      expect(result).toEqual({
        type: 'array',
        items: {
          type: 'number',
          example: 123.45,
        },
        example: [123.45],
      })
    })
  })

  describe('ZodEnum', () => {
    it('should convert enum schema', () => {
      const schema = z.enum(['red', 'green', 'blue'])
      const result = zodToOpenAPI(schema)

      expect(result).toEqual({
        type: 'string',
        enum: { red: 'red', green: 'green', blue: 'blue' },
      })
    })
  })

  describe('ZodLiteral', () => {
    it('should convert string literal schema', () => {
      const schema = z.literal('test')
      const result = zodToOpenAPI(schema)

      expect(result).toEqual({
        type: 'string',
        enum: ['test'],
        example: ['test'],
      })
    })

    it('should convert number literal schema', () => {
      const schema = z.literal(42)
      const result = zodToOpenAPI(schema)

      expect(result).toEqual({
        type: 'number',
        enum: [42],
        example: [42],
      })
    })
  })

  describe('ZodOptional', () => {
    it('should convert optional string schema', () => {
      const schema = z.string().optional()
      const result = zodToOpenAPI(schema)

      expect(result).toEqual({
        type: 'string',
        nullable: true,
        example: 'string',
      })
    })

    it('should convert optional number schema', () => {
      const schema = z.number().optional()
      const result = zodToOpenAPI(schema)

      expect(result).toEqual({
        type: 'number',
        nullable: true,
        example: 123.45,
      })
    })
  })

  describe('ZodNullable', () => {
    it('should convert nullable string schema', () => {
      const schema = z.string().nullable()
      const result = zodToOpenAPI(schema)

      expect(result).toEqual({
        type: 'string',
        nullable: true,
        example: 'string',
      })
    })

    it('should convert nullable boolean schema', () => {
      const schema = z.boolean().nullable()
      const result = zodToOpenAPI(schema)

      expect(result).toEqual({
        type: 'boolean',
        nullable: true,
        example: true,
      })
    })
  })

  describe('ZodObject', () => {
    it('should convert simple object schema', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      })
      const result = zodToOpenAPI(schema)

      expect(result).toEqual({
        type: 'object',
        properties: {
          name: {
            type: 'string',
            example: 'string',
          },
          age: {
            type: 'number',
            example: 123.45,
          },
        },
        required: ['name', 'age'],
        example: {
          name: 'string',
          age: 123.45,
        },
      })
    })

    it('should convert object with optional fields', () => {
      const schema = z.object({
        name: z.string(),
        email: z.email().optional(),
        isActive: z.boolean(),
      })
      const result = zodToOpenAPI(schema)

      expect(result).toEqual({
        type: 'object',
        properties: {
          name: {
            type: 'string',
            example: 'string',
          },
          email: {
            type: 'string',
            example: 'string',
            nullable: true,
          },
          isActive: {
            type: 'boolean',
            example: true,
          },
        },
        required: ['name', 'isActive'],
        example: {
          name: 'string',
          email: 'string',
          isActive: true,
        },
      })
    })

    it('should handle object with no required fields', () => {
      const schema = z.object({
        name: z.string().optional(),
        age: z.number().optional(),
      })
      const result = zodToOpenAPI(schema)

      expect(result).toEqual({
        type: 'object',
        properties: {
          name: {
            type: 'string',
            nullable: true,
            example: 'string',
          },
          age: {
            type: 'number',
            nullable: true,
            example: 123.45,
          },
        },
        example: {
          name: 'string',
          age: 123.45,
        },
      })
    })
  })

  describe('ZodCustom', () => {
    it('should convert file custom schema', () => {
      const fileSchema = z.custom<File>((val) => val instanceof File)
      const result = zodToOpenAPI(fileSchema)

      expect(result).toEqual({
        type: 'string',
        format: 'binary',
      })
    })

    it('should convert generic custom schema', () => {
      const customSchema = z.custom((val) => typeof val === 'string')
      const result = zodToOpenAPI(customSchema)

      expect(result).toEqual({
        type: 'string',
        example: 'custom',
      })
    })
  })

  describe('Edge cases', () => {
    it('should handle unknown schema types', () => {
      // Simulating an unknown schema type by creating a mock
      const unknownSchema = {} as z.ZodTypeAny
      const result = zodToOpenAPI(unknownSchema)

      expect(result).toEqual({
        type: 'string',
        example: 'string',
      })
    })

    it('should handle schema without examples', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number().int(),
      })
      const result = zodToOpenAPI(schema, false)

      expect(result).toEqual({
        type: 'object',
        properties: {
          name: {
            type: 'string',
          },
          age: {
            type: 'number',
          },
        },
        required: ['name', 'age'],
      })
    })
  })
})
