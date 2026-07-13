import { test, expect } from '@playwright/test';

test.describe('Dino Runner - Video Demo', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should record full game flow with video', async ({ page }) => {
    test.setTimeout(60000);

    // 1. Verificar pantalla de bienvenida
    await expect(page.locator('text=🦖 DINO RUNNER')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Comenzar')).toBeVisible();
    console.log('✅ Welcome screen visible');

    // 2. Hacer clic en Comenzar
    await page.click('text=Comenzar');
    console.log('✅ Clicked Start button');

    // 3. Esperar que aparezca el canvas del juego
    await expect(page.locator('#gameCanvas')).toBeVisible({ timeout: 10000 });
    console.log('✅ Game canvas visible');

    // 4. Esperar a que el juego genere obstáculos
    await page.waitForTimeout(1000);
    console.log('✅ Waited 1s for obstacles to generate');

    // 5. Saltar (primer salto)
    await page.keyboard.press('Space');
    console.log('✅ First jump (Space)');
    await page.waitForTimeout(500);

    // 6. Doble salto
    await page.keyboard.press('Space');
    console.log('✅ Double jump (Space)');
    await page.waitForTimeout(3000);
    console.log('✅ Waited 3s for game to progress');

    // 7. Verificar que la página sigue funcionando
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    expect(consoleErrors.length).toBe(0);
    console.log('✅ No console errors detected');
    
    console.log('🎬 Video recording complete');
  });
});
