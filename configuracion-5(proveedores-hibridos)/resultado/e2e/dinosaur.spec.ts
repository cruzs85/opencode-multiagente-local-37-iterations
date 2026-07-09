import { test, expect } from '@playwright/test';

test.describe('Dinosaur Runner Game E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    // Wait for the app to load
    await page.waitForSelector('app-root');
  });

  test('should load the game with correct initial state', async ({ page }) => {
    // Check that the game container is visible
    await expect(page.locator('.game-container')).toBeVisible();
    
    // Check that the game area is present
    await expect(page.locator('.game')).toBeVisible();
    
    // Check that the dinosaur is present
    await expect(page.locator('.dinosaur')).toBeVisible();
    
    // Check that the ground is present
    await expect(page.locator('.ground')).toBeVisible();
    
    // Check that debug info is present with correct format
    const debugInfo = page.locator('.debug-info');
    await expect(debugInfo).toBeVisible();
    
    // Check debug info format: "X: [value] Y: [value] V: [value]"
    const debugText = await debugInfo.textContent();
    expect(debugText).toMatch(/^X: \d+(\.\d+)? Y: \d+(\.\d+)? V: \d+(\.\d+)?$/);
    
    // Check initial Y position should be 50 (initial position from code)
    expect(debugText).toContain('Y: 50.0');
    
    // Check initial velocity should be 0
    expect(debugText).toContain('V: 0.0');
    
    // Check that start message is visible initially
    await expect(page.locator('.start-message')).toBeVisible();
  });

  test('should start game when SPACE is pressed', async ({ page }) => {
    // Initially, game should not be playing
    const startMessage = page.locator('.start-message');
    await expect(startMessage).toBeVisible();
    
    // Press SPACE to start the game
    await page.keyboard.press('Space');
    
    // Start message should disappear
    await expect(startMessage).not.toBeVisible();
    
    // Score should start incrementing
    const scoreElement = page.locator('.score');
    await expect(scoreElement).toBeVisible();
    
    // Wait a bit for score to increment
    await page.waitForTimeout(1000);
    
    const scoreText = await scoreElement.textContent();
    expect(scoreText).toContain('Puntuación:');
    // Score should be greater than 0 after 1 second
    const scoreMatch = scoreText?.match(/\d+/);
    if (scoreMatch) {
      const scoreValue = parseInt(scoreMatch[0], 10);
      expect(scoreValue).toBeGreaterThan(0);
    }
  });

  test('should make dinosaur jump when SPACE is pressed during game', async ({ page }) => {
    // Start the game
    await page.keyboard.press('Space');
    
    // Wait for game to start
    await page.waitForTimeout(500);
    
    // Get initial debug info
    const debugInfo = page.locator('.debug-info');
    const initialDebugText = await debugInfo.textContent();
    const initialYMatch = initialDebugText?.match(/Y: (\d+(\.\d+)?)/);
    const initialY = initialYMatch ? parseFloat(initialYMatch[1]) : 0;
    
    // Press SPACE to jump
    await page.keyboard.press('Space');
    
    // Wait for jump to take effect
    await page.waitForTimeout(300);
    
    // Get debug info after jump
    const afterJumpDebugText = await debugInfo.textContent();
    const afterJumpYMatch = afterJumpDebugText?.match(/Y: (\d+(\.\d+)?)/);
    const afterJumpY = afterJumpYMatch ? parseFloat(afterJumpYMatch[1]) : 0;
    
    // Y should have increased (since Y=0 is ground, positive Y means going up)
    expect(afterJumpY).toBeGreaterThan(initialY);
    
    // Velocity should be positive after jump
    const afterJumpVMatch = afterJumpDebugText?.match(/V: (\d+(\.\d+)?)/);
    const afterJumpV = afterJumpVMatch ? parseFloat(afterJumpVMatch[1]) : 0;
    expect(afterJumpV).toBeGreaterThan(0);
  });

  test('should apply gravity and bring dinosaur back down', async ({ page }) => {
    // Start the game
    await page.keyboard.press('Space');
    
    // Wait for game to start
    await page.waitForTimeout(500);
    
    // Make dinosaur jump
    await page.keyboard.press('Space');
    
    // Wait for peak of jump
    await page.waitForTimeout(500);
    
    // Get debug info at peak
    const debugInfo = page.locator('.debug-info');
    const peakDebugText = await debugInfo.textContent();
    const peakYMatch = peakDebugText?.match(/Y: (\d+(\.\d+)?)/);
    const peakY = peakYMatch ? parseFloat(peakYMatch[1]) : 0;
    
    // Wait for gravity to bring dinosaur down
    await page.waitForTimeout(1000);
    
    // Get debug info after falling
    const afterFallDebugText = await debugInfo.textContent();
    const afterFallYMatch = afterFallDebugText?.match(/Y: (\d+(\.\d+)?)/);
    const afterFallY = afterFallYMatch ? parseFloat(afterFallYMatch[1]) : 0;
    
    // Y should have decreased (coming back down)
    expect(afterFallY).toBeLessThan(peakY);
    
    // Eventually dinosaur should return to ground (Y: 0.0)
    await page.waitForTimeout(2000);
    const finalDebugText = await debugInfo.textContent();
    expect(finalDebugText).toContain('Y: 0.0');
    expect(finalDebugText).toContain('V: 0.0');
  });

  test('should not let dinosaur go below ground (Y < 0)', async ({ page }) => {
    // Start the game
    await page.keyboard.press('Space');
    
    // Wait for game to start
    await page.waitForTimeout(500);
    
    // Monitor debug info for 3 seconds
    const debugInfo = page.locator('.debug-info');
    
    for (let i = 0; i < 6; i++) {
      await page.waitForTimeout(500);
      const debugText = await debugInfo.textContent();
      const yMatch = debugText?.match(/Y: (-?\d+(\.\d+)?)/);
      const yValue = yMatch ? parseFloat(yMatch[1]) : 0;
      
      // Y should never be negative (below ground)
      expect(yValue).toBeGreaterThanOrEqual(0);
    }
  });

  test('should generate obstacles during gameplay', async ({ page }) => {
    // Start the game
    await page.keyboard.press('Space');
    
    // Wait for obstacles to generate
    await page.waitForTimeout(3000);
    
    // Check that obstacles are present
    const obstacles = page.locator('.obstacle');
    await expect(obstacles.first()).toBeVisible();
    
    // Count obstacles
    const obstacleCount = await obstacles.count();
    expect(obstacleCount).toBeGreaterThan(0);
    
    // Obstacles should have proper styling
    const firstObstacle = obstacles.first();
    await expect(firstObstacle).toHaveCSS('position', 'absolute');
    await expect(firstObstacle).toHaveCSS('background-color', 'rgb(83, 83, 83)'); // #535353 gray color
  });

  test('should detect collisions and trigger game over', async ({ page }) => {
    // Start the game
    await page.keyboard.press('Space');
    
    // Wait for game to start
    await page.waitForTimeout(500);
    
    // Let the game run long enough to potentially hit an obstacle
    // We'll run for 10 seconds to ensure collision happens
    await page.waitForTimeout(10000);
    
    // Check if game over screen appears
    const gameOverElement = page.locator('.game-over');
    
    // Game over might have happened
    const isGameOverVisible = await gameOverElement.isVisible();
    
    if (isGameOverVisible) {
      // Game over screen should be visible
      await expect(gameOverElement).toBeVisible();
      
      // Should show game over message
      await expect(gameOverElement.locator('h2')).toHaveText('¡Fin del juego!');
      
      // Should show final score
      const finalScoreText = await gameOverElement.locator('p').first().textContent();
      expect(finalScoreText).toContain('Puntuación final:');
      
      // Should show restart message
      await expect(gameOverElement.locator('.restart')).toHaveText('Presiona ESPACIO para jugar de nuevo');
    } else {
      // If no collision happened in 10 seconds, that's also valuable info
      console.log('No collision detected within 10 seconds - game is running properly');
      
      // Score should be increasing
      const scoreElement = page.locator('.score');
      const scoreText = await scoreElement.textContent();
      const scoreMatch = scoreText?.match(/\d+/);
      if (scoreMatch) {
        const scoreValue = parseInt(scoreMatch[0], 10);
        expect(scoreValue).toBeGreaterThan(100); // Should have decent score after 10 seconds
      }
    }
  });

  test('should restart game after game over', async ({ page }) => {
    // Start the game
    await page.keyboard.press('Space');
    
    // Wait a bit
    await page.waitForTimeout(1000);
    
    // Try to trigger game over by not jumping (let dinosaur hit obstacle)
    // Run for 15 seconds to ensure collision
    await page.waitForTimeout(15000);
    
    // Check for game over
    const gameOverElement = page.locator('.game-over');
    const isGameOverVisible = await gameOverElement.isVisible();
    
    if (isGameOverVisible) {
      // Press SPACE to restart
      await page.keyboard.press('Space');
      
      // Game over should disappear
      await expect(gameOverElement).not.toBeVisible();
      
      // Game should be playing again
      await page.waitForTimeout(1000);
      
      // Score should be reset (or very low)
      const scoreElement = page.locator('.score');
      const scoreText = await scoreElement.textContent();
      const scoreMatch = scoreText?.match(/\d+/);
      if (scoreMatch) {
        const scoreValue = parseInt(scoreMatch[0], 10);
        // Score should be relatively low after restart
        expect(scoreValue).toBeLessThan(200);
      }
    }
  });

  test('should save and display high score', async ({ page }) => {
    // Clear localStorage to start fresh
    await page.evaluate(() => {
      localStorage.removeItem('dino-high-score');
    });
    
    // Start the game
    await page.keyboard.press('Space');
    
    // Play for a bit
    await page.waitForTimeout(3000);
    
    // Check high score display
    const highScoreElement = page.locator('.high-score');
    await expect(highScoreElement).toBeVisible();
    
    const highScoreText = await highScoreElement.textContent();
    expect(highScoreText).toContain('Récord:');
    
    // If we get a game over and score > 0, high score should update
    // Let the game run longer to potentially get a score
    await page.waitForTimeout(7000);
    
    // Check localStorage for high score
    const highScore = await page.evaluate(() => {
      return localStorage.getItem('dino-high-score');
    });
    
    // If there's a high score in localStorage, it should be displayed
    if (highScore) {
      const highScoreValue = parseInt(highScore, 10);
      expect(highScoreValue).toBeGreaterThan(0);
      
      // The displayed high score should match localStorage
      const updatedHighScoreText = await highScoreElement.textContent();
      expect(updatedHighScoreText).toContain(highScoreValue.toString());
    }
  });
});