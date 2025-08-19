import { ApiUnauthorizedResponse } from '@nestjs/swagger'
import { z } from 'zod/v4'

import { zodToOpenAPI } from '@/utils/zod-to-openapi'

const jwtUnauthorizedResponseSchema = z.object({
  code: z
    .enum(['token.expired', 'token.invalid', 'refresh.expired'])
    .optional(),
  message: z.string().optional(),
  error: z.literal('Unauthorized'),
  statusCode: z.literal(401),
})

export type JwtUnauthorizedResponseSchema = z.infer<
  typeof jwtUnauthorizedResponseSchema
>

const jwtUnauthorizedResponseExample: JwtUnauthorizedResponseSchema = {
  code: 'token.expired',
  message: 'Token expirado.',
  error: 'Unauthorized',
  statusCode: 401,
}

export function JwtUnauthorizedResponse() {
  const openApiSchema = zodToOpenAPI(jwtUnauthorizedResponseSchema, false)
  openApiSchema.example = jwtUnauthorizedResponseExample

  return ApiUnauthorizedResponse({
    description: '',
    schema: openApiSchema,
  })
}
