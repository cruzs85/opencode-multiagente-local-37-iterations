import { test, expect } from '@playwright/test';

test('app has expected title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('DinoRunner');
});