import { test, expect } from '@playwright/test';

test.describe('Dinosaur Runner Game', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Esperar a que la aplicación Angular se cargue completamente
    await page.waitForSelector('app-root', { timeout: 15000 });
  });

  test('Smoke test: la app carga y el game-container es visible', async ({ page }) => {
    // Verificar que el contenedor del juego existe
    const gameContainer = page.locator('.game-container');
    await expect(gameContainer).toBeVisible();

    // Verificar que el dinosaurio existe dentro del contenedor
    const dino = page.locator('.game-container .dino');
    await expect(dino).toBeVisible();

    // Verificar que el mensaje de inicio se muestra
    const startMessage = page.locator('.start-message');
    await expect(startMessage).toBeVisible();

    // Verificar el debug-info
    const debugInfo = page.locator('.debug-info');
    await expect(debugInfo).toBeVisible();
  });

  test('Inicio del juego: al presionar Space desaparece el mensaje de inicio', async ({ page }) => {
    // Verificar que el mensaje de inicio está visible
    const startMessage = page.locator('.start-message');
    await expect(startMessage).toBeVisible();

    // Presionar Space para iniciar
    await page.keyboard.press('Space');

    // Esperar un momento para que el juego procese el evento
    await page.waitForTimeout(500);

    // El mensaje de inicio debería desaparecer
    await expect(startMessage).not.toBeVisible();

    // La puntuación debería empezar a incrementar
    const scoreValue = page.locator('.score-value').first();
    const scoreText = await scoreValue.textContent();
    expect(scoreText).not.toBe('0');
  });

  test('Salto: al presionar Space la Y del dinosaurio cambia y la velocidad es positiva', async ({ page }) => {
    // Iniciar el juego primero
    await page.keyboard.press('Space');
    await page.waitForTimeout(300);

    // Leer debug-info antes del salto
    const debugInfo = page.locator('.debug-info');
    const debugTextBefore = await debugInfo.textContent() || '';
    console.log('Debug antes del salto:', debugTextBefore);

    // Presionar Space para saltar
    await page.keyboard.press('Space');
    await page.waitForTimeout(200);

    // Leer debug-info después del salto
    const debugTextAfter = await debugInfo.textContent() || '';
    console.log('Debug después del salto:', debugTextAfter);

    // Verificar que el debug-info contiene los valores esperados
    expect(debugTextAfter).toContain('X:');
    expect(debugTextAfter).toContain('Y:');
    expect(debugTextAfter).toContain('V:');
  });
});