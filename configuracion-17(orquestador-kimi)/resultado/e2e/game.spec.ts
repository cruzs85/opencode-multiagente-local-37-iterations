import { test, expect } from '@playwright/test';

test.describe('Mecánicas del Juego', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('start-button').click();
    await expect(page.getByTestId('game-area')).toBeVisible();
  });

  test('el dinosaurio puede hacer un salto simple', async ({ page }) => {
    const dino = page.getByTestId('dino');
    await expect(dino).toBeVisible();

    const initialBottom = await dino.evaluate((el: HTMLElement) =>
      parseFloat(el.style.bottom || '0')
    );

    await page.getByTestId('game-area').click();
    await page.waitForTimeout(150);

    const jumpBottom = await dino.evaluate((el: HTMLElement) =>
      parseFloat(el.style.bottom || '0')
    );

    expect(jumpBottom).toBeGreaterThan(initialBottom);

    await page.waitForTimeout(800);
    const landedBottom = await dino.evaluate((el: HTMLElement) =>
      parseFloat(el.style.bottom || '0')
    );
    expect(landedBottom).toBeCloseTo(initialBottom, 0);
  });

  test('el dinosaurio puede hacer un doble salto', async ({ page }) => {
    const dino = page.getByTestId('dino');

    await page.getByTestId('game-area').click();
    await page.waitForTimeout(120);
    await page.getByTestId('game-area').click();
    await page.waitForTimeout(150);

    const doubleJumpBottom = await dino.evaluate((el: HTMLElement) =>
      parseFloat(el.style.bottom || '0')
    );

    expect(doubleJumpBottom).toBeGreaterThan(30);

    await page.waitForTimeout(1200);
    const landedBottom = await dino.evaluate((el: HTMLElement) =>
      parseFloat(el.style.bottom || '0')
    );
    expect(landedBottom).toBeCloseTo(0, 0);
  });

  test('los obstáculos se generan durante el juego', async ({ page }) => {
    await page.waitForTimeout(3000);

    const obstacles = page.getByTestId('obstacle');
    const count = await obstacles.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('la velocidad aumenta progresivamente durante al menos 10 segundos', async ({ page }) => {
    const speedDisplay = page.getByTestId('speed');
    
    const initialSpeedText = await speedDisplay.textContent();
    const initialSpeed = parseInt(initialSpeedText || '300', 10);

    // Saltar periódicamente para evitar obstáculos durante ~11 segundos
    const jumpInterval = setInterval(async () => {
      try {
        await page.getByTestId('game-area').click();
      } catch {
        clearInterval(jumpInterval);
      }
    }, 400);

    await page.waitForTimeout(11000);
    clearInterval(jumpInterval);

    const finalSpeedText = await speedDisplay.textContent();
    const finalSpeed = parseInt(finalSpeedText || '300', 10);

    expect(finalSpeed).toBeGreaterThan(initialSpeed);
  });
});
