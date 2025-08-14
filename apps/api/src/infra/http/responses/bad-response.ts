import z from 'zod/v4'

export const badResponseSchema = z.object({
  message: z.string(),
  statusCode: z.literal(400),
})

type BadResponseSchema = z.infer<typeof badResponseSchema>

export const generateBadResponseExample = ({
  message,
}: {
  message: string
}): BadResponseSchema => ({
  message,
  statusCode: 400,
})
