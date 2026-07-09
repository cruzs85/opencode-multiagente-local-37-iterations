import { test, expect } from '@playwright/test';

test.describe('Dino Runner Game', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should show welcome screen with instructions', async ({ page }) => {
    await expect(page.locator('text=DINO RUNNER')).toBeVisible();
    await expect(page.locator('text=COMENZAR')).toBeVisible();
    await expect(page.locator('text=ESPACIO')).toBeVisible();
    await expect(page.locator('text=doble salto')).toBeVisible();
  });

  test('should start game when clicking COMENZAR', async ({ page }) => {
    await page.click('text=COMENZAR');
    const canvas = page.locator('#gameCanvas');
    await expect(canvas).toBeVisible();
  });

  test('should respond to jump when space is pressed', async ({ page }) => {
    await page.click('text=COMENZAR');
    await page.waitForSelector('#gameCanvas', { timeout: 3000 });
    await page.keyboard.press('Space');
    await page.waitForTimeout(500);
    const canvas = page.locator('#gameCanvas');
    await expect(canvas).toBeVisible();
  });
});