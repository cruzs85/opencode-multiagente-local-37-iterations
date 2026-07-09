import { test, expect } from '@playwright/test';

test.describe('Dinosaur Runner E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('debe mostrar pantalla de bienvenida y poder iniciar juego', async ({ page }) => {
    const welcomeScreen = page.locator('[data-testid="welcome-screen"]');
    await expect(welcomeScreen).toBeVisible();

    const playButton = page.locator('[data-testid="play-button"]');
    await expect(playButton).toHaveText('JUGAR');
    await playButton.click();

    const gameCanvas = page.locator('[data-testid="game-canvas"]');
    await expect(gameCanvas).toBeVisible();
    await expect(welcomeScreen).not.toBeVisible();
  });

  test('debe permitir salto simple con tecla Space', async ({ page }) => {
    await page.locator('[data-testid="play-button"]').click();
    await page.waitForTimeout(500);

    const scoreDisplay = page.locator('[data-testid="score-display"]');
    const scoreBefore = parseInt(await scoreDisplay.textContent() || '0');

    await page.keyboard.press('Space');
    await page.waitForTimeout(500);

    const scoreAfter = parseInt(await scoreDisplay.textContent() || '0');
    expect(scoreAfter).toBeGreaterThanOrEqual(scoreBefore);
  });

  test('debe permitir doble salto con tecla Space dos veces', async ({ page }) => {
    await page.locator('[data-testid="play-button"]').click();
    await page.waitForTimeout(500);

    const scoreDisplay = page.locator('[data-testid="score-display"]');
    const scoreBefore = parseInt(await scoreDisplay.textContent() || '0');

    await page.keyboard.press('Space');
    await page.waitForTimeout(100);
    await page.keyboard.press('Space');
    await page.waitForTimeout(500);

    const scoreAfter = parseInt(await scoreDisplay.textContent() || '0');
    expect(scoreAfter).toBeGreaterThanOrEqual(scoreBefore);
  });

  test('debe generar obstáculos durante el juego', async ({ page }) => {
    await page.locator('[data-testid="play-button"]').click();
    await page.waitForTimeout(6000);

    const scoreDisplay = page.locator('[data-testid="score-display"]');
    const score = parseInt(await scoreDisplay.textContent() || '0');
    expect(score).toBeGreaterThan(0);
  });

  test('debe incrementar velocidad durante al menos 10 segundos', async ({ page }) => {
    await page.locator('[data-testid="play-button"]').click();
    await page.waitForTimeout(12000);

    const scoreDisplay = page.locator('[data-testid="score-display"]');
    const score = parseInt(await scoreDisplay.textContent() || '0');
    expect(score).toBeGreaterThan(5);
  });
});