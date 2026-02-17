import { test, expect } from '@playwright/test';

test('smoke: app loads', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading')).toBeVisible();
});