import { test, expect } from '@playwright/test';

/**
 * Helper: espera a que Angular exponga el GameService en window.__gameService
 * y devuelve el estado actual del juego.
 */
async function getGameState(page: any) {
  return page.evaluate(() => {
    return new Promise((resolve) => {
      const check = () => {
        const el = document.querySelector('app-game-area') || document.querySelector('app-welcome-screen');
        if (el) {
          // Intentamos acceder al componente Angular
          const ng = (window as any).ng;
          if (ng) {
            const component = ng.getComponent(el);
            if (component && component.gameService) {
              const gs = component.gameService;
              resolve({
                phase: gs.phase(),
                score: gs.score(),
                highScore: gs.highScore(),
                speed: gs.speed(),
                gameOver: gs.gameOver(),
                dino: gs.dino(),
                obstacles: gs.obstacles(),
                groundOffset: gs.groundOffset(),
              });
              return;
            }
          }
        }
        setTimeout(check, 100);
      };
      check();
    });
  });
}

test.describe('Dino Runner Game', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('01 - Pantalla de bienvenida visible con instrucciones', async ({ page }) => {
    // Verificar que la pantalla de bienvenida se muestra
    const welcomeScreen = page.locator('app-welcome-screen');
    await expect(welcomeScreen).toBeVisible({ timeout: 10000 });

    // Verificar que contiene el título
    await expect(page.locator('text=Dino Runner')).toBeVisible();

    // Verificar que contiene instrucciones
    await expect(page.locator('app-welcome-screen .welcome__instructions').locator('kbd').first()).toBeVisible();
    await expect(page.locator('text=doble salto')).toBeVisible();

    // Verificar que el botón "Comenzar" está visible
    const startBtn = page.locator('button:has-text("Comenzar")');
    await expect(startBtn).toBeVisible();
  });

  test('02 - Salto simple con tecla Espacio', async ({ page }) => {
    // Iniciar el juego haciendo clic en "Comenzar"
    await page.locator('button:has-text("Comenzar")').click();

    // Esperar a que aparezca el canvas
    await expect(page.locator('#game-canvas')).toBeVisible({ timeout: 5000 });

    // Esperar un momento para que el juego se inicialice
    await page.waitForTimeout(500);

    // Obtener estado inicial del dino
    let state: any = await getGameState(page);
    const initialY = state.dino.y;
    expect(state.phase).toBe('playing');

    // Presionar Espacio para saltar
    await page.keyboard.press('Space');

    // Esperar un frame para que el salto se procese
    await page.waitForTimeout(100);

    // Verificar que el dino está en el aire (y cambió)
    state = await getGameState(page);
    expect(state.dino.isJumping).toBe(true);
    expect(state.dino.jumpCount).toBe(1);

    // Esperar a que el dino vuelva al suelo
    await page.waitForTimeout(600);

    state = await getGameState(page);
    expect(state.dino.isJumping).toBe(false);
    expect(state.dino.jumpCount).toBe(0);
  });

  test('03 - Doble salto con dos pulsaciones de Espacio', async ({ page }) => {
    // Iniciar el juego
    await page.locator('button:has-text("Comenzar")').click();
    await expect(page.locator('#game-canvas')).toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(500);

    // Primer salto
    await page.keyboard.press('Space');
    await page.waitForTimeout(150);

    let state: any = await getGameState(page);
    expect(state.dino.isJumping).toBe(true);
    expect(state.dino.jumpCount).toBe(1);

    // Segundo salto (doble salto) - antes de que caiga
    await page.keyboard.press('Space');
    await page.waitForTimeout(100);

    state = await getGameState(page);
    expect(state.dino.jumpCount).toBe(2);
  });

  test('04 - Los obstáculos se generan durante el juego', async ({ page }) => {
    // Iniciar el juego
    await page.locator('button:has-text("Comenzar")').click();
    await expect(page.locator('#game-canvas')).toBeVisible({ timeout: 5000 });

    // Esperar a que se generen obstáculos (mínimo 2 segundos)
    await page.waitForTimeout(3000);

    const state: any = await getGameState(page);

    // Verificar que hay al menos un obstáculo
    expect(state.obstacles.length).toBeGreaterThanOrEqual(1);
  });

  test('05 - La velocidad se incrementa con el tiempo', async ({ page }) => {
    // Iniciar el juego
    await page.locator('button:has-text("Comenzar")').click();
    await expect(page.locator('#game-canvas')).toBeVisible({ timeout: 5000 });

    // Velocidad inicial (medir inmediatamente, sin esperar)
    let state0: any = await getGameState(page);
    let initialSpeed = state0.speed;

    // Saltar inmediatamente para evitar el primer obstáculo
    await page.keyboard.press('Space');

    // Mantener el dino vivo saltando frecuentemente durante 12 segundos
    let maxSpeed = initialSpeed;
    let maxScore = 0;
    for (let i = 0; i < 60; i++) {
      await page.waitForTimeout(200);
      // Saltar en cada iteración para evitar obstáculos
      await page.keyboard.press('Space');
      // Registrar velocidad máxima alcanzada
      const currentState: any = await getGameState(page);
      if (currentState.speed > maxSpeed) {
        maxSpeed = currentState.speed;
      }
      if (currentState.score > maxScore) {
        maxScore = currentState.score;
      }
    }

    // La velocidad máxima alcanzada debe ser mayor que la inicial
    expect(maxSpeed).toBeGreaterThan(initialSpeed);
    // El puntaje debe ser > 0 (hubo progreso)
    expect(maxScore).toBeGreaterThan(0);
  });
});
