import z from 'zod/v4'

export const unsupportedMediaTypeResponseSchema = z.object({
  message: z.string(),
  error: 'Unsupported Media Type',
  statusCode: z.literal(415),
})

type UnsupportedMediaTypeResponseSchema = z.infer<
  typeof unsupportedMediaTypeResponseSchema
>

export const generateUnsupportedMediaTypeResponseExample =
  (): UnsupportedMediaTypeResponseSchema => ({
    message: 'Tipo de arquivo inválido: text/markdown',
    error: 'Unsupported Media Type',
    statusCode: 415,
  })
