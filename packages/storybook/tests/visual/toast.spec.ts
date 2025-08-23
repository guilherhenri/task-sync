import { expect, test } from '@playwright/test'

test('Toast Success', async ({ page }) => {
  await page.goto('/iframe.html?id=feedback-toast--success')
  await expect(page.locator('.toast--success')).toHaveScreenshot(
    'toast-success.png',
  )
})

test('Toast Error', async ({ page }) => {
  await page.goto('/iframe.html?id=feedback-toast--error')
  await expect(page.locator('.toast--error')).toHaveScreenshot(
    'toast-error.png',
  )
})

test('Toast Warning', async ({ page }) => {
  await page.goto('/iframe.html?id=feedback-toast--warning')
  await expect(page.locator('.toast--warning')).toHaveScreenshot(
    'toast-warning.png',
  )
})
