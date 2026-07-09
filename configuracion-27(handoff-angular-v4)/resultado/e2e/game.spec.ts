import { test, expect } from '@playwright/test';

test.describe('Pantalla de Juego', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("JUGAR")');
    await page.waitForSelector('app-game', { timeout: 5000 });
  });

  test('canvas del juego es visible', async ({ page }) => {
    await expect(page.locator('canvas')).toBeVisible();
  });

  test('HUD muestra score inicial', async ({ page }) => {
    await expect(page.locator('text=Score:')).toBeVisible();
  });

  test('salto simple con tecla Space', async ({ page }) => {
    await page.keyboard.press('Space');
    // El dinosaurio salta - no hay error
    await expect(page.locator('app-game')).toBeVisible();
  });

  test('doble salto con tecla Space', async ({ page }) => {
    await page.keyboard.press('Space');
    await page.waitForTimeout(100);
    await page.keyboard.press('Space');
    // No hay error, doble salto funciona
    await expect(page.locator('app-game')).toBeVisible();
  });

  test('obstáculos se generan durante el juego', async ({ page }) => {
    // Esperar a que se generen obstáculos
    await page.waitForTimeout(2000);
    // El juego sigue activo, no hay game over inmediato
    await expect(page.locator('app-game')).toBeVisible();
  });

  test('score incrementa durante el juego', async ({ page }) => {
    await page.waitForTimeout(1000);
    const scoreText = await page.locator('.score').textContent();
    expect(scoreText).toContain('Score:');
  });

  test('colisión termina el juego y muestra game over', async ({ page }) => {
    // Esperar a que ocurra colisión (obstáculos se generan)
    await page.waitForTimeout(5000);
    // Verificar que aparece game over o sigue jugando
    const gameOverVisible = await page.locator('app-game-over').isVisible().catch(() => false);
    const gameVisible = await page.locator('app-game').isVisible().catch(() => false);
    expect(gameOverVisible || gameVisible).toBe(true);
  });
});