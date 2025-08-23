import { expect, test } from '@playwright/test'

test('Label Primary', async ({ page }) => {
  await page.goto('/iframe.html?id=form-label--primary')
  await expect(page.locator('.label')).toHaveScreenshot('label-primary.png')
})
