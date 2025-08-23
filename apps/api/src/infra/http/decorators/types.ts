import type { OpenAPISchema } from '@/utils/zod-to-openapi'

export type OpenApiDecoratorConfig = {
  description?: string
  schema: OpenAPISchema
}
