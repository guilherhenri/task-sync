import { z } from 'zod/v4'

export const unauthorizedResponseSchema = z.object({
  message: z.string(),
  error: z.literal('Unauthorized'),
  statusCode: z.literal(401),
})

type unauthorizedResponseSchema = z.infer<typeof unauthorizedResponseSchema>

export const generateUnauthorizedResponseExample = (
  message: unauthorizedResponseSchema['message'],
): unauthorizedResponseSchema => ({
  message,
  error: 'Unauthorized',
  statusCode: 401,
})
