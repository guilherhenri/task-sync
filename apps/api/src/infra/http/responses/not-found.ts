import { z } from 'zod/v4'

export const notFoundResponseSchema = z.object({
  message: z.string(),
  error: z.literal('Not Found'),
  statusCode: z.literal(404),
})

type NotFoundResponseSchema = z.infer<typeof notFoundResponseSchema>

export const generateNotFoundResponseExample = (
  message: NotFoundResponseSchema['message'],
): NotFoundResponseSchema => ({
  message,
  error: 'Not Found',
  statusCode: 404,
})
