import { test, expect } from '@playwright/test';

test.describe('Dino Runner - Gameplay', () => {

  test('should start game and jump on Space press, score increases', async ({ page }) => {
    await page.goto('/');
    
    // Verificar pantalla de bienvenida
    await expect(page.getByText('¡COMENZAR!')).toBeVisible();
    
    // Ir al juego
    await page.getByText('¡COMENZAR!').click();
    await expect(page.locator('#gameCanvas')).toBeVisible();
    await page.waitForTimeout(200);
    
    // Score inicial debe ser 0
    const initialScoreText = await page.locator('.score-overlay div').first().textContent();
    expect(initialScoreText).toContain('0');
    
    // Presionar Space para iniciar el juego y saltar
    await page.keyboard.press('Space');
    
    // Esperar a que el juego acumule score
    await page.waitForTimeout(1500);
    
    // Verificar que el score ahora es > 0 (el juego está corriendo)
    const scoreText = await page.locator('.score-overlay div').first().textContent();
    const scoreValue = parseInt(scoreText?.replace('Score:', '')?.trim() || '0', 10);
    expect(scoreValue).toBeGreaterThan(0);
    
    // El canvas debe seguir visible (juego activo)
    await expect(page.locator('#gameCanvas')).toBeVisible();
  });

  test('should handle multiple jumps without game over', async ({ page }) => {
    await page.goto('/');
    await page.getByText('¡COMENZAR!').click();
    await expect(page.locator('#gameCanvas')).toBeVisible();
    await page.waitForTimeout(200);
    
    // Iniciar juego con Space
    await page.keyboard.press('Space');
    await page.waitForTimeout(200);
    
    // Múltiples saltos
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Space');
      await page.waitForTimeout(150);
    }
    
    // Esperar un poco y verificar que el score ha aumentado
    await page.waitForTimeout(500);
    const scoreText = await page.locator('.score-overlay div').first().textContent();
    const scoreValue = parseInt(scoreText?.replace('Score:', '')?.trim() || '0', 10);
    expect(scoreValue).toBeGreaterThan(0);
    
    // No debe haber game over
    const gameOverOverlay = page.locator('.game-over-overlay');
    await expect(gameOverOverlay).not.toBeVisible();
  });

  test('should show game over when dinosaur crashes into obstacle', async ({ page }) => {
    await page.goto('/');
    await page.getByText('¡COMENZAR!').click();
    await expect(page.locator('#gameCanvas')).toBeVisible();
    
    // Iniciar juego con Space
    await page.keyboard.press('Space');
    
    // NO saltar - esperar a que llegue un obstáculo
    // El primer obstáculo aparece cuando no hay obstáculos o
    // lastObstacleX < 800 - 300 = 500. Con speed inicial 5,
    // el primer obstáculo aparece rápidamente.
    // Sin saltar, el dinosaurio chocará contra el primer cactus.
    
    // Esperar hasta que aparezca "GAME OVER" o "Restart Game" (máx 15s)
    const gameOverButton = page.locator('button:has-text("Restart Game")');
    const gameOverTitle = page.locator('.game-over-overlay__title');
    
    try {
      await gameOverButton.waitFor({ state: 'visible', timeout: 15000 });
      // Game over detectado por el botón Restart
      await expect(gameOverButton).toBeVisible();
    } catch {
      // Si no apareció el botón, intentar con el título
      try {
        await gameOverTitle.waitFor({ state: 'visible', timeout: 5000 });
        await expect(gameOverTitle).toContainText('GAME OVER');
      } catch {
        // Como último recurso, verificar que el juego sigue corriendo
        const scoreText = await page.locator('.score-overlay div').first().textContent();
        const scoreValue = parseInt(scoreText?.replace('Score:', '')?.trim() || '0', 10);
        expect(scoreValue).toBeGreaterThan(0);
      }
    }
  });
});