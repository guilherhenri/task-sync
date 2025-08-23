import { expect, test } from '@playwright/test'

test('Card Primary', async ({ page }) => {
  await page.goto('/iframe.html?id=surfaces-card--primary')
  await expect(page.locator('.card')).toHaveScreenshot('card-primary.png')
})
