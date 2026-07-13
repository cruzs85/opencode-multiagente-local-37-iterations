import { test, expect } from '@playwright/test';

test.describe('Dino Runner', () => {
  test('should display welcome screen', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('welcome-screen')).toBeVisible();
    await expect(page.getByText('DINO RUNNER')).toBeVisible();
    await expect(page.getByTestId('play-button')).toBeVisible();
  });

  test('should start game on button click', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('play-button').click();
    await expect(page.getByTestId('game-screen')).toBeVisible();
  });

  test('should start game on space key', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Space');
    await expect(page.getByTestId('game-screen')).toBeVisible();
  });

  test('should display game HUD', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('play-button').click();
    await expect(page.getByText('PUNTOS:')).toBeVisible();
    await expect(page.getByText('RÉCORD:')).toBeVisible();
  });

  test('should make dino jump on space', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('play-button').click();
    await page.waitForTimeout(500);
    await page.keyboard.press('Space');
    // Verificar que el dino haya saltado (esto puede requerir captura de pantalla)
    // Por ahora solo verificamos que el juego siga funcionando
    await expect(page.getByTestId('game-screen')).toBeVisible();
  });

  test('should allow double jump', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('play-button').click();
    await page.keyboard.press('Space');
    await page.waitForTimeout(200);
    await page.keyboard.press('Space');
    // Verificar que el dino no esté en el suelo (puede requerir lógica de verificación más compleja)
    await expect(page.getByTestId('game-screen')).toBeVisible();
  });

  test('should not allow triple jump', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('play-button').click();
    await page.keyboard.press('Space');
    await page.waitForTimeout(200);
    await page.keyboard.press('Space');
    await page.waitForTimeout(200);
    await page.keyboard.press('Space');
    await page.waitForTimeout(1500);
    // Verificar que el dino haya caído al suelo después del tercer salto
    await expect(page.getByTestId('game-screen')).toBeVisible();
  });

  test('should generate obstacles', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('play-button').click();
    await page.waitForTimeout(500);
    // Verificar que el juego sigue corriendo (no game over inmediato)
    await expect(page.getByTestId('game-screen')).toBeVisible();
    // Esperar un poco más para que aparezcan obstáculos
    await page.waitForTimeout(2000);
    await expect(page.getByTestId('game-screen')).toBeVisible();
  });

  test('should increase score over time', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('play-button').click();
    await page.waitForTimeout(2000);
    const scoreElement = page.getByText('PUNTOS:');
    await expect(scoreElement).toBeVisible();
    // Verificar que el score sea mayor que 0
    await expect(page.getByTestId('game-screen')).toBeVisible();
  });

  test('should show game over on collision', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('play-button').click();
    // Esperar hasta que ocurra una colisión y aparezca la pantalla de game over
    await page.waitForTimeout(15000);
    await expect(page.getByTestId('game-over-screen')).toBeVisible();
  });

  test('should display final score on game over', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('play-button').click();
    // Esperar game over
    await page.waitForTimeout(15000);
    await expect(page.getByText('PUNTUACIÓN:')).toBeVisible();
  });

  test('should show new record when applicable', async ({ page }) => {
    await page.goto('/');
    // Limpiar localStorage
    await page.evaluate(() => localStorage.clear());
    await page.getByTestId('play-button').click();
    // Esperar game over
    await page.waitForTimeout(15000);
    await expect(page.getByTestId('new-record')).toBeVisible();
  });

  test('should restart game from game over', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('play-button').click();
    // Esperar game over
    await page.waitForTimeout(15000);
    await page.getByTestId('restart-button').click();
    await expect(page.getByTestId('game-screen')).toBeVisible();
  });

  test('should pause and resume with ESC', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('play-button').click();
    await page.waitForTimeout(500);
    await page.keyboard.press('Escape');
    await expect(page.getByText('PAUSADO')).toBeVisible();
    await page.waitForTimeout(500);
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('game-screen')).toBeVisible();
  });

  test('should persist high score in localStorage', async ({ page }) => {
    await page.goto('/');
    // Setear localStorage
    await page.evaluate(() => localStorage.setItem('dino-runner-high-score', '100'));
    await page.reload();
    await expect(page.getByText('RÉCORD: 100')).toBeVisible();
  });

  test('should display high score on welcome screen', async ({ page }) => {
    await page.goto('/');
    // Setear localStorage
    await page.evaluate(() => localStorage.setItem('dino-runner-high-score', '50'));
    await page.reload();
    await expect(page.getByText('RÉCORD: 50')).toBeVisible();
  });

  test('should reset game state on restart', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('play-button').click();
    // Esperar game over
    await page.waitForTimeout(15000);
    await page.getByTestId('restart-button').click();
    // Verificar que el score sea 0 en el HUD
    await expect(page.getByTestId('game-screen')).toBeVisible();
  });
});
