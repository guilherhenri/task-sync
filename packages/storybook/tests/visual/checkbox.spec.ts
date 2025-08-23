import { expect, test } from '@playwright/test'

test('Checkbox Primary', async ({ page }) => {
  await page.goto('/iframe.html?id=form-checkbox--primary')
  await expect(page.locator('.checkbox')).toHaveScreenshot(
    'checkbox-primary.png',
  )
})
