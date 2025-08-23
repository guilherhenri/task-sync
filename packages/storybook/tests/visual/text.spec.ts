import { expect, test } from '@playwright/test'

test('Text Default', async ({ page }) => {
  await page.goto('/iframe.html?id=typography-text--default')
  await expect(page.locator('#storybook-root')).toHaveScreenshot(
    'text-default.png',
  )
})
