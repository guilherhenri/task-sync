import { z } from 'zod/v4'

export const goneResponseSchema = z.object({
  message: z.string(),
  error: z.literal('Gone'),
  statusCode: z.literal(410),
})

type goneResponseSchema = z.infer<typeof goneResponseSchema>

export const generateGoneResponseExample = (
  message: goneResponseSchema['message'],
): goneResponseSchema => ({
  message,
  error: 'Gone',
  statusCode: 410,
})
