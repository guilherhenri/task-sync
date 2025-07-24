import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const envServerSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().optional().default(3333),

  APP_URL: z.string().url(),
  LOGO_CDN_URL: z.string().url(),

  EMAIL_DEFAULT_SENDER: z.string().email(),

  POSTGRES_HOST: z.string().optional().default('127.0.0.1'),
  POSTGRES_PORT: z.coerce.number().optional().default(5432),
  POSTGRES_USER: z.string(),
  POSTGRES_PASSWORD: z.string(),
  POSTGRES_DB: z.string(),
})

export type EnvServer = z.infer<typeof envServerSchema>

export const env = createEnv({
  server: envServerSchema.shape,
  client: {},
  shared: {},
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,

    APP_URL: process.env.APP_URL,
    LOGO_CDN_URL: process.env.LOGO_CDN_URL,

    EMAIL_DEFAULT_SENDER: process.env.EMAIL_DEFAULT_SENDER,

    POSTGRES_HOST: process.env.POSTGRES_HOST,
    POSTGRES_PORT: process.env.POSTGRES_PORT,
    POSTGRES_USER: process.env.POSTGRES_USER,
    POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
    POSTGRES_DB: process.env.POSTGRES_DB,
  },
  emptyStringAsUndefined: true,
})
