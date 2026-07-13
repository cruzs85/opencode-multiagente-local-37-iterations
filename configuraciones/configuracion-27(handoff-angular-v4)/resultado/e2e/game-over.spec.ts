import { test, expect } from '@playwright/test';

test.describe('Pantalla de Game Over', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("JUGAR")');
    await page.waitForSelector('app-game', { timeout: 5000 });
    // Esperar a que ocurra game over (colisión)
    await page.waitForTimeout(6000);
  });

  test('renderiza pantalla de game over', async ({ page }) => {
    await expect(page.locator('app-game-over')).toBeVisible();
  });

  test('muestra texto GAME OVER', async ({ page }) => {
    await expect(page.locator('text=GAME OVER')).toBeVisible();
  });

  test('muestra score final', async ({ page }) => {
    await expect(page.locator('.score-final')).toBeVisible();
  });

  test('botón REINTENTAR navega a pantalla de juego', async ({ page }) => {
    await page.click('button:has-text("REINTENTAR")');
    await expect(page.locator('app-game')).toBeVisible();
  });

  test('botón MENÚ navega a pantalla de bienvenida', async ({ page }) => {
    await page.click('button:has-text("MENÚ")');
    await expect(page.locator('app-welcome')).toBeVisible();
  });
});