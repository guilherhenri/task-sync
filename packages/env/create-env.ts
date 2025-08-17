import { z } from 'zod/v4'

type CreateEnvOptions<
  TServer extends Record<string, z.ZodType> = Record<string, never>,
  TClient extends Record<string, z.ZodType> = Record<string, never>,
  TShared extends Record<string, z.ZodType> = Record<string, never>,
> = {
  server?: TServer
  client?: TClient
  shared?: TShared
  runtimeEnv: Record<string, string | undefined>
  emptyStringAsUndefined?: boolean
}

export function createEnv<
  TServer extends Record<string, z.ZodType>,
  TClient extends Record<string, z.ZodType>,
  TShared extends Record<string, z.ZodType>,
>(
  opts: CreateEnvOptions<TServer, TClient, TShared>,
): Readonly<z.infer<z.ZodObject<TServer & TClient & TShared>>> {
  const allSchemas = {
    ...opts.server,
    ...opts.client,
    ...opts.shared,
  } as TServer & TClient & TShared

  const schema = z.object(allSchemas) as z.ZodObject<
    TServer & TClient & TShared
  >

  const processedEnv: Record<string, string | undefined> = {}

  Object.keys(allSchemas).forEach((key) => {
    let value = opts.runtimeEnv[key]

    if (opts.emptyStringAsUndefined && value === '') {
      value = undefined
    }

    processedEnv[key] = value
  })

  try {
    const parsed = schema.parse(processedEnv)
    return Object.freeze(parsed) as Readonly<
      z.infer<z.ZodObject<TServer & TClient & TShared>>
    >
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingKeys = error.issues
        .filter(
          (err) =>
            err.code === 'invalid_type' &&
            err.message.includes('receive undefined'),
        )
        .map((err) => err.path.join('.'))

      if (missingKeys.length > 0) {
        throw new Error(
          `Missing required environment variables: ${missingKeys.join(', ')}`,
        )
      }
    }
    throw error
  }
}

export type { CreateEnvOptions }
