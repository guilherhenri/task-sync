import { expect, test } from '@playwright/test'

test('Button Primary', async ({ page }) => {
  await page.goto('/iframe.html?id=form-button--primary')
  await expect(page.locator('.btn')).toHaveScreenshot('button-primary.png')
})

test('Button Full Width', async ({ page }) => {
  await page.goto('/iframe.html?id=form-button--full-width')
  await expect(page.locator('.btn--full')).toHaveScreenshot(
    'button-fullwidth.png',
  )
})
