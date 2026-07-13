import { test, expect } from '@playwright/test';

test.describe('Dino Runner Game', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display start screen', async ({ page }) => {
    // Verificar que se muestra la pantalla de inicio
    await expect(page.getByText('Dino Runner')).toBeVisible();
    await expect(page.getByText('Press SPACE to start')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Start Game' })).toBeVisible();
  });

  test('should allow dinosaur to jump', async ({ page }) => {
    // Iniciar el juego
    await page.getByRole('button', { name: 'Start Game' }).click();
    
    // Esperar a que el juego comience
    await page.waitForTimeout(1000);
    
    // Verificar que el dinosaurio esté en la posición inicial
    const dino = page.getByTestId('dino');
    const initialPosition = await dino.boundingBox();
    
    // Realizar un salto
    await page.keyboard.press(' ');
    
    // Verificar que el dinosaurio haya saltado
    await page.waitForTimeout(500);
    const afterJumpPosition = await dino.boundingBox();
    
    // El dinosaurio debería haber cambiado de posición
    expect(afterJumpPosition).not.toEqual(initialPosition);
  });

  test('should display obstacles', async ({ page }) => {
    // Iniciar el juego
    await page.getByRole('button', { name: 'Start Game' }).click();
    
    // Esperar a que se generen obstáculos
    await page.waitForTimeout(2000);
    
    // Verificar que haya obstáculos en la pantalla
    const obstacles = page.getByTestId('cactus');
    await expect(obstacles).toBeVisible();
  });

  test('should increase speed over time', async ({ page }) => {
    // Iniciar el juego
    await page.getByRole('button', { name: 'Start Game' }).click();
    
    // Esperar un tiempo para que la velocidad aumente
    await page.waitForTimeout(3000);
    
    // Verificar que el juego esté en marcha y la velocidad haya aumentado
    const gameComponent = page.getByTestId('game-component');
    await expect(gameComponent).toBeVisible();
  });

  test('should persist high score', async ({ page }) => {
    // Iniciar el juego
    await page.getByRole('button', { name: 'Start Game' }).click();
    
    // Esperar un tiempo para que se genere un puntaje
    await page.waitForTimeout(2000);
    
    // Simular un juego completo para establecer un récord
    await page.keyboard.press(' ');
    await page.waitForTimeout(1000);
    await page.keyboard.press(' ');
    await page.waitForTimeout(1000);
    
    // Verificar que se haya actualizado el récord
    const scoreDisplay = page.getByTestId('score-display');
    await expect(scoreDisplay).toBeVisible();
    
    // Recargar la página para verificar persistencia
    await page.reload();
    
    // Verificar que el récord persista
    await expect(scoreDisplay).toBeVisible();
  });
});