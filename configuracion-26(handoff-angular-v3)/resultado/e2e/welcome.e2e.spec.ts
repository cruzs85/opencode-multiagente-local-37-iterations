import { test, expect } from '@playwright/test';

test.describe('Welcome Screen', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('welcome screen is visible', async ({ page }) => {
    await expect(page.locator('.welcome-container')).toBeVisible();
  });

  test('welcome screen has title', async ({ page }) => {
    const title = page.locator('.welcome-container .title');
    await expect(title).toBeVisible();
    await expect(title).toHaveText('DINO RUNNER');
  });

  test('welcome screen has instructions', async ({ page }) => {
    const instructions = page.locator('.welcome-container .instructions');
    await expect(instructions).toBeVisible();
    await expect(instructions).toContainText('Jump over obstacles');
  });

  test('welcome screen has start button', async ({ page }) => {
    const button = page.locator('.welcome-container .neon-button');
    await expect(button).toBeVisible();
    await expect(button).toHaveText('START GAME');
  });

  test('welcome screen shows high score', async ({ page }) => {
    const scoreDisplay = page.locator('.welcome-container .score-display');
    await expect(scoreDisplay).toBeVisible();
    await expect(scoreDisplay).toContainText('HIGH SCORE');
  });

  test('click start button navigates to game', async ({ page }) => {
    await page.click('.welcome-container .neon-button');
    await expect(page.locator('app-game')).toBeVisible();
    await expect(page.locator('.game-canvas')).toBeVisible();
  });
});
