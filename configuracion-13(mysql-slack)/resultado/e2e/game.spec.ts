import { test, expect } from '@playwright/test';

test.describe('Dino Runner Game', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should show welcome screen with title', async ({ page }) => {
    await expect(page.locator('text=🦖 DINO RUNNER')).toBeVisible();
    await expect(page.locator('text=Comenzar')).toBeVisible();
  });

  test('should show instructions on welcome screen', async ({ page }) => {
    await expect(page.locator('text=doble salto permitido')).toBeVisible();
  });

  test('should start game when clicking start button', async ({ page }) => {
    await page.click('text=Comenzar');
    // After clicking start, the game canvas should appear
    await expect(page.locator('#gameCanvas')).toBeVisible();
  });

  test('should start game when pressing Space', async ({ page }) => {
    await page.keyboard.press('Space');
    await expect(page.locator('#gameCanvas')).toBeVisible();
  });

  test('should jump when pressing Space while playing', async ({ page }) => {
    await page.keyboard.press('Space');
    await expect(page.locator('#gameCanvas')).toBeVisible();
    // Press space again to jump
    await page.keyboard.press('Space');
    // Game should still be playing (no game over from jumping)
    await expect(page.locator('#gameCanvas')).toBeVisible();
  });

  test('should play the game for several seconds and show gameplay', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=🦖 DINO RUNNER')).toBeVisible();
    await page.keyboard.press('Space');
    await expect(page.locator('#gameCanvas')).toBeVisible();
    
    // Play for several seconds with jumps
    await page.waitForTimeout(500);
    await page.keyboard.press('Space'); // First jump
    await page.waitForTimeout(800);
    await page.keyboard.press('Space'); // Second jump
    await page.waitForTimeout(600);
    await page.keyboard.press('Space'); // Double jump attempt
    await page.keyboard.press('Space');
    await page.waitForTimeout(1000);
    await page.keyboard.press('Space'); // Another jump
    await page.waitForTimeout(1500); // Let game continue
    
    // Take screenshot to verify gameplay
    await page.screenshot({ path: 'test-results/gameplay-screenshot.png' });
    
    // Verify game is still running (canvas visible)
    await expect(page.locator('#gameCanvas')).toBeVisible();
  });
});
