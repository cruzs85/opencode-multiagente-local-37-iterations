import { test, expect } from '@playwright/test';

test.describe('Pantalla de Bienvenida', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('renderiza pantalla de bienvenida', async ({ page }) => {
    await expect(page.locator('app-welcome')).toBeVisible();
  });

  test('muestra título DINO RUNNER', async ({ page }) => {
    await expect(page.locator('text=DINO RUNNER')).toBeVisible();
  });

  test('muestra instrucciones del juego', async ({ page }) => {
    await expect(page.locator('text=Salta con ESPACIO')).toBeVisible();
    await expect(page.locator('text=Doble salto')).toBeVisible();
    await expect(page.locator('text=Evita obstáculos')).toBeVisible();
  });

  test('botón JUGAR es visible y clickable', async ({ page }) => {
    const button = page.locator('button:has-text("JUGAR")');
    await expect(button).toBeVisible();
    await expect(button).toBeEnabled();
  });

  test('click en JUGAR navega a pantalla de juego', async ({ page }) => {
    await page.click('button:has-text("JUGAR")');
    await expect(page.locator('app-game')).toBeVisible();
  });
});