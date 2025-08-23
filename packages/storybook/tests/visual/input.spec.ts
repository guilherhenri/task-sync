import { expect, test } from '@playwright/test'

test('Input Primary', async ({ page }) => {
  await page.goto('/iframe.html?id=form-input--primary')
  await expect(page.locator('.input')).toHaveScreenshot('input-primary.png')
})
