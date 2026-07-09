import { test, expect } from '@playwright/test';

test('should display welcome screen', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.welcome-container')).toBeVisible();
});

test('should display correct title', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1.title')).toContainText('DINO RUN');
});

test('should display instructions', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.instruction-item')).toHaveCount(4);
});

test('should display start button', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('button.start-button')).toBeVisible();
  await expect(page.locator('button.start-button')).toContainText('INICIAR JUEGO');
});

test('should navigate to game on button click', async ({ page }) => {
  await page.goto('/');
  await page.locator('button.start-button').click();
  await expect(page).toHaveURL('/game');
  await expect(page.locator('.game-container')).toBeVisible();
});
