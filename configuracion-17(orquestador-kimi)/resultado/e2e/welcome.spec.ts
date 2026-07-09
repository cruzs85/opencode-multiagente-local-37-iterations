import { test, expect } from '@playwright/test';

test.describe('Pantalla de Bienvenida', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('muestra el título del juego y las instrucciones', async ({ page }) => {
    await expect(page.getByText('Dino Runner')).toBeVisible();
    await expect(page.getByText('Cómo jugar')).toBeVisible();
    await expect(page.getByText('ESPACIO')).toBeVisible();
    await expect(page.getByText('DOBLE SALTO')).toBeVisible();
  });

  test('tiene un botón de inicio funcional', async ({ page }) => {
    const startButton = page.getByTestId('start-button');
    await expect(startButton).toBeVisible();
    await expect(startButton).toHaveText(/JUGAR/);
    
    await startButton.click();
    
    await expect(page.getByTestId('game-area')).toBeVisible();
    await expect(page.getByTestId('dino')).toBeVisible();
  });
});
