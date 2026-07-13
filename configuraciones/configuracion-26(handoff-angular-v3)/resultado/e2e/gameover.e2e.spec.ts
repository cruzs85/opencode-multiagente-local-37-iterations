import { test, expect } from '@playwright/test';

test.describe('Game Over Screen', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('.welcome-container .neon-button');
    await page.waitForSelector('app-game', { timeout: 5000 });
  });

  test('game over screen appears after collision', async ({ page }) => {
    await page.waitForSelector('app-gameover', { timeout: 15000 });
    const gameOver = page.locator('app-gameover');
    await expect(gameOver).toBeVisible();
  });

  test('game over shows score', async ({ page }) => {
    await page.waitForSelector('app-gameover', { timeout: 15000 });
    const scoreSection = page.locator('.gameover-container .score-section');
    await expect(scoreSection).toBeVisible();
    await expect(scoreSection).toContainText('SCORE');
  });

  test('game over shows high score', async ({ page }) => {
    await page.waitForSelector('app-gameover', { timeout: 15000 });
    const scoreSections = page.locator('.gameover-container .score-section');
    await expect(scoreSections).toHaveCount(2);
    await expect(scoreSections.nth(1)).toContainText('BEST');
  });

  test('game over has restart button', async ({ page }) => {
    await page.waitForSelector('app-gameover', { timeout: 15000 });
    const retryButton = page.locator('.gameover-container .neon-button.retry');
    await expect(retryButton).toBeVisible();
    await expect(retryButton).toHaveText('TRY AGAIN');
  });

  test('restart button navigates to game', async ({ page }) => {
    await page.waitForSelector('app-gameover', { timeout: 15000 });
    await page.click('.gameover-container .neon-button.retry');
    await expect(page.locator('app-game')).toBeVisible();
    await expect(page.locator('.game-canvas')).toBeVisible();
  });

  test('menu button navigates to welcome', async ({ page }) => {
    await page.waitForSelector('app-gameover', { timeout: 15000 });
    await page.click('.gameover-container .neon-button.menu');
    await expect(page.locator('app-welcome')).toBeVisible();
    await expect(page.locator('.welcome-container .title')).toHaveText('DINO RUNNER');
  });

  test('high score persists after restart', async ({ page }) => {
    await page.waitForSelector('app-gameover', { timeout: 15000 });
    const highScore = await page.locator('.gameover-container .score-section').nth(1).textContent() || '0';
    const highScoreValue = parseInt(highScore.replace(/\D/g, ''), 10) || 0;
    await page.click('.gameover-container .neon-button.retry');
    await page.waitForSelector('app-game', { timeout: 5000 });
    await page.waitForSelector('app-gameover', { timeout: 15000 });
    const newHighScore = await page.locator('.gameover-container .score-section').nth(1).textContent() || '0';
    const newHighScoreValue = parseInt(newHighScore.replace(/\D/g, ''), 10) || 0;
    expect(newHighScoreValue).toBeGreaterThanOrEqual(highScoreValue);
  });
});
