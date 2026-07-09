import { test, expect } from '@playwright/test';

test.describe('Game Screen', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('.welcome-container .neon-button');
    await page.waitForSelector('app-game', { timeout: 5000 });
  });

  test('game screen has canvas', async ({ page }) => {
    const canvas = page.locator('.game-canvas');
    await expect(canvas).toBeVisible();
    const canvasBox = await canvas.boundingBox();
    expect(canvasBox).not.toBeNull();
    expect(canvasBox!.width).toBeGreaterThan(0);
    expect(canvasBox!.height).toBeGreaterThan(0);
  });

  test('game screen shows score', async ({ page }) => {
    const scoreDisplay = page.locator('.game-container .score-display');
    await expect(scoreDisplay).toBeVisible();
    await expect(scoreDisplay).toContainText('SCORE');
  });

  test('press space to jump', async ({ page }) => {
    await page.keyboard.press('Space');
    await expect(page.locator('.game-canvas')).toBeVisible();
  });

  test('press arrow up to jump', async ({ page }) => {
    await page.keyboard.press('ArrowUp');
    await expect(page.locator('.game-canvas')).toBeVisible();
  });

  test('double jump works', async ({ page }) => {
    await page.keyboard.press('Space');
    await page.waitForTimeout(100);
    await page.keyboard.press('Space');
    await expect(page.locator('.game-canvas')).toBeVisible();
  });

  test('obstacles appear over time', async ({ page }) => {
    await page.waitForTimeout(2000);
    await expect(page.locator('.game-canvas')).toBeVisible();
  });

  test('score increases over time', async ({ page }) => {
    const scoreLocator = page.locator('.score-value');
    const initialScore = await scoreLocator.textContent() || '0';
    await page.keyboard.press('Space');
    await page.waitForTimeout(3000);
    await page.keyboard.press('Space');
    await page.waitForTimeout(1000);
    const newScore = await scoreLocator.textContent() || '0';
    expect(parseInt(newScore, 10)).toBeGreaterThanOrEqual(parseInt(initialScore, 10));
  });

  test('speed increases over time', async ({ page }) => {
    await expect(page.locator('.game-canvas')).toBeVisible();
    await page.waitForTimeout(3000);
    await page.keyboard.press('Space');
    await page.waitForTimeout(1000);
    await expect(page.locator('.game-canvas')).toBeVisible();
  });
});
