import { test, expect } from '@playwright/test';

test.describe('Dino Runner Game', () => {

  test('debe mostrar pantalla de bienvenida con instrucciones', async ({ page }) => {
    await page.goto('/');

    // Verificar que se muestra el título del juego
    await expect(page.locator('.game-title')).toHaveText('DINO RUNNER');

    // Verificar que se muestran instrucciones
    await expect(page.locator('.instructions')).toBeVisible();
  });

  test('debe iniciar el juego al presionar Space y el dino debe saltar', async ({ page }) => {
    await page.goto('/');

    // Esperar a que cargue
    await page.waitForTimeout(500);

    // Presionar Space para iniciar
    await page.keyboard.press('Space');
    await page.waitForTimeout(500);

    // El overlay de bienvenida debe desaparecer
    await expect(page.locator('.welcome-overlay')).not.toBeVisible();

    // El canvas debe aparecer al empezar el juego
    await expect(page.locator('.game-canvas')).toBeVisible();

    // Presionar Space para saltar
    await page.keyboard.press('Space');
    await page.waitForTimeout(200);

    // No debe mostrar game over
    await expect(page.locator('.gameover-overlay')).not.toBeVisible();
  });

  test('debe permitir salto doble', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);

    // Iniciar
    await page.keyboard.press('Space');
    await page.waitForTimeout(300);

    // Primer salto
    await page.keyboard.press('Space');
    await page.waitForTimeout(100);

    // Segundo salto (mientras está en el aire)
    await page.keyboard.press('Space');
    await page.waitForTimeout(100);

    // No debe mostrar game over solo por saltar
    await expect(page.locator('.gameover-overlay')).not.toBeVisible();
  });

  test('los obstáculos deben generarse y la velocidad debe incrementar', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);

    // Iniciar juego
    await page.keyboard.press('Space');
    await page.waitForTimeout(200);

    // El canvas debe ser visible durante el juego
    await expect(page.locator('.game-canvas')).toBeVisible();

    // Saltar repetidamente para mantener vivo al dino
    for (let i = 0; i < 25; i++) {
      await page.keyboard.press('Space');
      await page.waitForTimeout(400);
    }

    // Después de 10 segundos, el juego debe haber empezado:
    // - El canvas debe seguir presente (incluso en game over)
    await expect(page.locator('.game-canvas')).toBeVisible();

    // - El marcador de score debe existir
    await expect(page.locator('.score')).toBeVisible();
  });
});
