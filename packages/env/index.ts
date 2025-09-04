import { z } from 'zod/v4'

import { createEnv } from './create-env'

export const envServerSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().optional().default(3333),
  APP_VERSION: z.string(),

  JWT_PRIVATE_KEY: z.string(),
  JWT_PUBLIC_KEY: z.string(),

  COOKIE_SECRET: z.string(),

  APP_URL: z.url(),

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

  SUPABASE_URL: z.url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
  SUPABASE_STORAGE_BUCKET: z.string(),

  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  LOG_ENABLE_CONSOLE: z
    .string()
    .optional()
    .default('false')
    .transform((val) => val === 'true'),
  LOG_ENABLE_FILE: z
    .string()
    .optional()
    .default('false')
    .transform((val) => val === 'true'),
  LOG_ENABLE_EXTERNAL: z
    .string()
    .optional()
    .default('false')
    .transform((val) => val === 'true'),
  LOG_DIR: z.string(),
  LOG_MAX_SIZE: z.string(),
  LOG_MAX_FILES: z.string(),
  VECTOR_ENDPOINT: z.url(),
  VECTOR_TIMEOUT: z.string(),
})

export type EnvServer = z.infer<typeof envServerSchema>

export const env = createEnv({
  server: envServerSchema.shape,
  client: {},
  shared: {},
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    APP_VERSION: process.env.APP_VERSION,

    JWT_PRIVATE_KEY: process.env.JWT_PRIVATE_KEY,
    JWT_PUBLIC_KEY: process.env.JWT_PUBLIC_KEY,

    COOKIE_SECRET: process.env.COOKIE_SECRET,

    APP_URL: process.env.APP_URL,

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

    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_STORAGE_BUCKET: process.env.SUPABASE_STORAGE_BUCKET,

    LOG_LEVEL: process.env.LOG_LEVEL,
    LOG_ENABLE_CONSOLE: process.env.LOG_ENABLE_CONSOLE,
    LOG_ENABLE_FILE: process.env.LOG_ENABLE_FILE,
    LOG_ENABLE_EXTERNAL: process.env.LOG_ENABLE_EXTERNAL,
    LOG_DIR: process.env.LOG_DIR,
    LOG_MAX_SIZE: process.env.LOG_MAX_SIZE,
    LOG_MAX_FILES: process.env.LOG_MAX_FILES,
    VECTOR_ENDPOINT: process.env.VECTOR_ENDPOINT,
    VECTOR_TIMEOUT: process.env.VECTOR_TIMEOUT,
  },
  emptyStringAsUndefined: true,
})
