import { z } from 'zod/v4'

export const conflictResponseSchema = z.object({
  message: z.string(),
  error: z.literal('Conflict'),
  statusCode: z.literal(409),
})

type ConflictResponseSchema = z.infer<typeof conflictResponseSchema>

export const generateConflictResponseExample = (
  message: ConflictResponseSchema['message'],
): ConflictResponseSchema => ({
  message,
  error: 'Conflict',
  statusCode: 409,
})
