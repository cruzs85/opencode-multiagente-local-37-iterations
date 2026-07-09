import { test, expect } from '@playwright/test';

async function navigateToGame(page) {
  await page.goto('/');
  await page.locator('button.start-button').click();
  await expect(page.locator('.game-container')).toBeVisible();
}

test.describe('Game Over Screen', () => {
  test('should show game over screen', async ({ page }) => {
    await navigateToGame(page);
    await page.waitForTimeout(7000);
    await expect(page.locator('.overlay')).toBeVisible();
  });

  test('should display final score', async ({ page }) => {
    await navigateToGame(page);
    await page.waitForTimeout(7000);
    await expect(page.locator('.final-score')).toContainText(/\d+/);
  });

  test('should restart game on retry button', async ({ page }) => {
    await navigateToGame(page);
    await page.waitForTimeout(7000);
    await page.locator('.retry-button').click();
    await expect(page.locator('.overlay')).not.toBeVisible();
    await expect(page.locator('.game-container')).toBeVisible();
  });

  test('should return to menu on menu button', async ({ page }) => {
    await navigateToGame(page);
    await page.waitForTimeout(7000);
    await page.locator('.menu-button').click();
    await expect(page.locator('.welcome-container')).toBeVisible();
  });
});
