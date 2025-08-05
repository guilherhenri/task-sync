import { z } from 'zod/v4'

import { createEnv } from './create-env'

export const envServerSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().optional().default(3333),

  APP_URL: z.url(),
  LOGO_CDN_URL: z.url(),

  SMTP_HOST: z.string(),
  SMTP_PORT: z.coerce.number(),
  SMTP_USER: z.string(),
  SMTP_PASS: z.string(),

  EMAIL_DEFAULT_SENDER: z.email(),

  POSTGRES_HOST: z.string().optional().default('127.0.0.1'),
  POSTGRES_PORT: z.coerce.number().optional().default(5432),
  POSTGRES_USER: z.string(),
  POSTGRES_PASSWORD: z.string(),
  POSTGRES_DB: z.string(),
  POSTGRES_SCHEMA: z.string().optional().default('public'),

  MONGO_URI: z.string(),
  MONGO_DB: z.string(),
  MONGO_USERNAME: z.string(),
  MONGO_PASSWORD: z.string(),

  REDIS_HOST: z.string().optional().default('127.0.0.1'),
  REDIS_PORT: z.coerce.number().optional().default(6379),
  REDIS_DB: z.coerce.number().optional().default(0),
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

    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,

    EMAIL_DEFAULT_SENDER: process.env.EMAIL_DEFAULT_SENDER,

    POSTGRES_HOST: process.env.POSTGRES_HOST,
    POSTGRES_PORT: process.env.POSTGRES_PORT,
    POSTGRES_USER: process.env.POSTGRES_USER,
    POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
    POSTGRES_DB: process.env.POSTGRES_DB,
    POSTGRES_SCHEMA: process.env.POSTGRES_SCHEMA,

    MONGO_URI: process.env.MONGO_URI,
    MONGO_DB: process.env.MONGO_DB,
    MONGO_USERNAME: process.env.MONGO_USERNAME,
    MONGO_PASSWORD: process.env.MONGO_PASSWORD,

    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: process.env.REDIS_PORT,
    REDIS_DB: process.env.REDIS_DB,
  },
  emptyStringAsUndefined: true,
})
