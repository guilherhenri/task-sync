import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const envServerSchema = z.object({
  APP_URL: z.string().url(),
  LOGO_CDN_URL: z.string().url(),

  EMAIL_DEFAULT_SENDER: z.string().email(),
})

export type EnvServer = z.infer<typeof envServerSchema>

export const env = createEnv({
  server: envServerSchema.shape,
  client: {},
  shared: {},
  runtimeEnv: {
    APP_URL: process.env.APP_URL,
    LOGO_CDN_URL: process.env.LOGO_CDN_URL,

    EMAIL_DEFAULT_SENDER: process.env.EMAIL_DEFAULT_SENDER,
  },
  emptyStringAsUndefined: true,
})
