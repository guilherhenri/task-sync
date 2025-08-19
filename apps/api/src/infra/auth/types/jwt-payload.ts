import { z } from 'zod/v4'

export const tokenPayloadSchema = z.object({
  sub: z.uuid(),
})

export type UserPayload = z.infer<typeof tokenPayloadSchema>
