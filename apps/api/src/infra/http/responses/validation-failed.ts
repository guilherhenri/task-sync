import z from 'zod/v4'

export const validationFailedResponseSchema = z.object({
  message: z.string(),
  statusCode: z.literal(400),
  errors: z.object({
    type: z.literal('validation'),
    details: z.array(
      z.object({
        field: z.string(),
        message: z.string(),
      }),
    ),
  }),
})

type ValidationFailedResponseSchema = z.infer<
  typeof validationFailedResponseSchema
>

export const generateValidationFailedResponseExample = ({
  field,
  message,
}: {
  field: string
  message: string
}): ValidationFailedResponseSchema => ({
  message: 'Validation failed',
  statusCode: 400,
  errors: {
    type: 'validation',
    details: [
      {
        field,
        message,
      },
    ],
  },
})
