import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    APP_URL: z.string().url(),
    LOGO_CDN_URL: z.string().url(),
  },
  client: {},
  shared: {},
  runtimeEnv: {
    APP_URL: process.env.APP_URL,
    LOGO_CDN_URL: process.env.LOGO_CDN_URL,
  },
  emptyStringAsUndefined: true,
})
