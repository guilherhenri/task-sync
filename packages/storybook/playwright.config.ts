import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/visual',
  use: { baseURL: 'http://localhost:6006' },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:6006',
    reuseExistingServer: !process.env.CI,
  },
})
