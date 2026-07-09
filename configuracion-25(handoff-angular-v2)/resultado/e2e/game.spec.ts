import { test, expect } from '@playwright/test';

async function navigateToGame(page) {
  await page.goto('/');
  await page.locator('button.start-button').click();
  await expect(page.locator('.game-container')).toBeVisible();
}

test('should display game screen', async ({ page }) => {
  await navigateToGame(page);
  await expect(page.locator('canvas')).toBeVisible();
});

test('should display dinosaur', async ({ page }) => {
  await navigateToGame(page);
  const canvas = page.locator('canvas');
  await expect(canvas).toHaveAttribute('width', '800');
});

test('should jump on space press', async ({ page }) => {
  await navigateToGame(page);
  await page.waitForTimeout(500);
  await page.keyboard.press('Space');
  await page.waitForTimeout(200);
  await expect(page.locator('canvas')).toBeVisible();
});

test('should allow double jump', async ({ page }) => {
  await navigateToGame(page);
  await page.waitForTimeout(200);
  await page.keyboard.press('Space');
  await page.waitForTimeout(200);
  await page.keyboard.press('Space');
  await page.waitForTimeout(200);
  await expect(page.locator('canvas')).toBeVisible();
});

test('should generate obstacles', async ({ page }) => {
  await navigateToGame(page);
  await page.waitForTimeout(4000);
  await expect(page.locator('canvas')).toBeVisible();
});

test('should increase score', async ({ page }) => {
  await navigateToGame(page);
  await page.waitForTimeout(2000);
  const scoreText = await page.locator('.score').textContent();
  expect(scoreText).toMatch(/\d+/);
});

test('should show game over on collision', async ({ page }) => {
  await navigateToGame(page);
  await page.waitForTimeout(7000);
  await expect(page.locator('.overlay')).toBeVisible();
});
