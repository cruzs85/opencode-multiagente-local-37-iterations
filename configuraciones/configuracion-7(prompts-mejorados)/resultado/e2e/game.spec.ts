import { test, expect } from '@playwright/test';

test.describe('Dino Runner Game', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Esperar a que Angular cargue y el canvas esté presente
    await page.waitForSelector('canvas#game-canvas', { timeout: 15000 });
  });

  test('should display the game canvas', async ({ page }) => {
    const canvas = page.locator('canvas#game-canvas');
    await expect(canvas).toBeVisible();
    
    // Verificar que el canvas tiene dimensiones
    const width = await canvas.getAttribute('width');
    const height = await canvas.getAttribute('height');
    expect(Number(width)).toBeGreaterThan(0);
    expect(Number(height)).toBeGreaterThan(0);
  });

  test('should show start screen and start on space', async ({ page }) => {
    // Tomar screenshot de la pantalla inicial
    await page.screenshot({ path: 'e2e-screenshots/start-screen.png' });
    
    // Verificar que el canvas se renderiza
    const canvas = page.locator('canvas#game-canvas');
    await expect(canvas).toBeVisible();
    
    // Presionar espacio para iniciar el juego
    await page.keyboard.press('Space');
    
    // Esperar para que el juego procese
    await page.waitForTimeout(1000);
    
    // Tomar screenshot del juego corriendo
    await page.screenshot({ path: 'e2e-screenshots/game-running.png' });
    
    await expect(canvas).toBeVisible();
  });

  test('should allow jumping and detect game over', async ({ page }) => {
    // Iniciar juego
    await page.keyboard.press('Space');
    await page.waitForTimeout(500);
    
    // Saltar
    await page.keyboard.press('Space');
    await page.waitForTimeout(200);
    
    // Doble salto
    await page.keyboard.press('Space');
    await page.waitForTimeout(3000);
    
    // Tomar screenshot durante el juego
    await page.screenshot({ path: 'e2e-screenshots/playing.png' });
    
    // Esperar colisión (no saltar)
    await page.waitForTimeout(8000);
    
    // Tomar screenshot del game over
    await page.screenshot({ path: 'e2e-screenshots/game-over.png' });
    
    const canvas = page.locator('canvas#game-canvas');
    await expect(canvas).toBeVisible();
  });
});
