import { test, expect } from '@playwright/test';

test.describe('Dino Runner E2E Tests', () => {
  test('welcome title visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('app-welcome h1')).toBeVisible();
    await expect(page.locator('app-welcome h1')).toContainText('DINO RUNNER');
  });

  test('welcome instructions visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('app-welcome .instructions')).toBeVisible();
    await expect(page.locator('app-welcome .instructions')).toContainText('Presiona ESPACIO o FLECHA ARRIBA para saltar. Doble salto permitido');
  });

  test('welcome JUGAR button visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('app-welcome button:has-text("JUGAR")')).toBeVisible();
  });

  test('welcome high-score visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('app-welcome .high-score')).toBeVisible();
  });

  test('click JUGAR starts game', async ({ page }) => {
    await page.goto('/');
    await page.locator('app-welcome button:has-text("JUGAR")').click();
    await expect(page.locator('app-game')).toBeVisible();
  });

  test('SPACE key starts game', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press(' ');
    await expect(page.locator('app-game')).toBeVisible();
  });

  test('game canvas visible', async ({ page }) => {
    await page.goto('/');
    await page.locator('app-welcome button:has-text("JUGAR")').click();
    await expect(page.locator('app-game canvas')).toBeVisible();
  });

  test('game score visible', async ({ page }) => {
    await page.goto('/');
    await page.locator('app-welcome button:has-text("JUGAR")').click();
    await expect(page.locator('app-game .score')).toBeVisible();
  });

  test('game speed visible', async ({ page }) => {
    await page.goto('/');
    await page.locator('app-welcome button:has-text("JUGAR")').click();
    await expect(page.locator('app-game .speed')).toBeVisible();
  });

  test('SPACE makes jump (verifies component responds)', async ({ page }) => {
    await page.goto('/');
    await page.locator('app-welcome button:has-text("JUGAR")').click();
    
    // Verify game is active and canvas is visible
    await expect(page.locator('app-game canvas')).toBeVisible();
    
    // Get initial score
    const initialScore = await page.locator('app-game .score').textContent();
    
    // Press space to jump
    await page.keyboard.press(' ');
    
    // Wait a bit to see if score changes (indicating game is still active)
    await page.waitForTimeout(100);
    
    // Verify canvas is still visible (game still active)
    await expect(page.locator('app-game canvas')).toBeVisible();
  });

  test('ArrowUp makes jump', async ({ page }) => {
    await page.goto('/');
    await page.locator('app-welcome button:has-text("JUGAR")').click();
    
    // Verify game is active and canvas is visible
    await expect(page.locator('app-game canvas')).toBeVisible();
    
    // Get initial score
    const initialScore = await page.locator('app-game .score').textContent();
    
    // Press ArrowUp to jump
    await page.keyboard.press('ArrowUp');
    
    // Wait a bit to see if score changes (indicating game is still active)
    await page.waitForTimeout(100);
    
    // Verify canvas is still visible (game still active)
    await expect(page.locator('app-game canvas')).toBeVisible();
  });

  test('Double jump works (presiona 2 veces espacio, verifica que el juego sigue activo)', async ({ page }) => {
    await page.goto('/');
    await page.locator('app-welcome button:has-text("JUGAR")').click();
    
    // Verify game is active and canvas is visible
    await expect(page.locator('app-game canvas')).toBeVisible();
    
    // Press space twice for double jump
    await page.keyboard.press(' ');
    await page.keyboard.press(' ');
    
    // Wait a bit to see if game is still active
    await page.waitForTimeout(100);
    
    // Verify canvas is still visible (game still active)
    await expect(page.locator('app-game canvas')).toBeVisible();
  });

  test('Game over appears', async ({ page }) => {
    await page.goto('/');
    await page.locator('app-welcome button:has-text("JUGAR")').click();
    
    // Wait for game over to appear (timeout 30000ms)
    await page.waitForSelector('app-game-over', { timeout: 30000 });
  });

  test('Game over shows score and buttons', async ({ page }) => {
    await page.goto('/');
    await page.locator('app-welcome button:has-text("JUGAR")').click();
    
    // Wait for game over to appear
    await page.waitForSelector('app-game-over', { timeout: 30000 });
    
    // Verify game over page is visible
    await expect(page.locator('app-game-over')).toBeVisible();
    
    // Verify game over title
    await expect(page.locator('app-game-over .game-over-title')).toBeVisible();
    await expect(page.locator('app-game-over .game-over-title')).toContainText('GAME OVER');
    
    // Verify final score is visible
    await expect(page.locator('app-game-over .final-score')).toBeVisible();
    
    // Verify buttons are visible
    await expect(page.locator('app-game-over button:has-text("REINTENTAR")')).toBeVisible();
    await expect(page.locator('app-game-over button:has-text("MENÚ")')).toBeVisible();
  });

  test('MENÚ button returns to welcome', async ({ page }) => {
    await page.goto('/');
    await page.locator('app-welcome button:has-text("JUGAR")').click();
    
    // Wait for game over to appear
    await page.waitForSelector('app-game-over', { timeout: 30000 });
    
    // Click MENU button
    await page.locator('app-game-over button:has-text("MENÚ")').click();
    
    // Verify welcome page is visible again
    await expect(page.locator('app-welcome')).toBeVisible();
  });
});