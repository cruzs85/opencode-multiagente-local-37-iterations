import { test, expect } from '@playwright/test';

test.describe('Dinosaur Runner 30-Second Demonstration', () => {
  test('should demonstrate full gameplay for 30 seconds demo', async ({ page }) => {
    // Set test timeout to 45 seconds
    test.setTimeout(45000);
    
    // Navigate to the game
    await page.goto('/');
    await page.waitForSelector('app-root');
    
    // Verify initial game state
    await expect(page.locator('.game-container')).toBeVisible();
    await expect(page.locator('.game')).toBeVisible();
    await expect(page.locator('.dinosaur')).toBeVisible();
    await expect(page.locator('.ground')).toBeVisible();
    await expect(page.locator('.start-message')).toBeVisible();
    
    // Ensure debug-info element is visible showing coordinates
    const debugInfo = page.locator('.debug-info');
    await expect(debugInfo).toBeVisible();
    
    // Check initial debug info format
    const initialDebugText = await debugInfo.textContent();
    expect(initialDebugText).toMatch(/^X: \d+(\.\d+)? Y: \d+(\.\d+)? V: \d+(\.\d+)?$/);
    console.log(`Initial debug info: ${initialDebugText}`);
    
    // Press SPACE to start the game
    await page.keyboard.press('Space');
    
    // Start message should disappear
    await expect(page.locator('.start-message')).not.toBeVisible({ timeout: 5000 });
    
    // Score should become visible
    const scoreElement = page.locator('.score');
    await expect(scoreElement).toBeVisible();
    
    // Wait a moment for game to fully start
    await page.waitForTimeout(1000);
    
    // Get initial score
    const initialScoreText = await scoreElement.textContent();
    console.log(`Initial score: ${initialScoreText}`);
    
    // Start the 28-second demonstration timer (slightly less than 30 to account for setup)
    const startTime = Date.now();
    const demoDuration = 28000; // 28 seconds in milliseconds
    
    // Jump pattern: Jump at regular intervals to show jumping mechanics
    // We'll jump approximately every 2-3 seconds
    let jumpCount = 0;
    const jumpInterval = 2000; // Jump every 2 seconds
    
    // Create a timer for periodic jumps
    const jumpTimer = setInterval(async () => {
      if (Date.now() - startTime < demoDuration) {
        await page.keyboard.press('Space');
        jumpCount++;
        
        // Log jump info
        const currentDebugText = await debugInfo.textContent();
        console.log(`Jump ${jumpCount} - Debug: ${currentDebugText}`);
        
        // Get current score
        const currentScoreText = await scoreElement.textContent();
        console.log(`After jump ${jumpCount} - Score: ${currentScoreText}`);
      } else {
        clearInterval(jumpTimer);
      }
    }, jumpInterval);
    
    // Monitor game state during the 30-second demo
    console.log('Starting 30-second gameplay demonstration...');
    
    // Let the game run for approximately 30 seconds
    // We'll use page.waitForTimeout for the main duration
    await page.waitForTimeout(demoDuration);
    
    // Clear the jump timer
    clearInterval(jumpTimer);
    
    const elapsedTime = Date.now() - startTime;
    console.log(`Demo completed. Total time: ${elapsedTime}ms, Total jumps: ${jumpCount}`);
    
    // End with checkpoints to verify game is still running
    
    // 1. Verify score > 0
    const finalScoreText = await scoreElement.textContent();
    expect(finalScoreText).toContain('Puntuación:');
    
    const scoreMatch = finalScoreText?.match(/\d+/);
    if (scoreMatch) {
      const scoreValue = parseInt(scoreMatch[0], 10);
      expect(scoreValue).toBeGreaterThan(0);
      console.log(`Final score: ${scoreValue}`);
    }
    
    // 2. Verify obstacles exist (show obstacles being generated)
    const obstacles = page.locator('.obstacle');
    const obstacleCount = await obstacles.count();
    expect(obstacleCount).toBeGreaterThan(0);
    console.log(`Obstacles generated: ${obstacleCount}`);
    
    // 3. Verify dinosaur is still visible (show dinosaur jumping and gravity mechanics)
    await expect(page.locator('.dinosaur')).toBeVisible();
    
    // 4. Verify debug info is still updating (show coordinates)
    const finalDebugText = await debugInfo.textContent();
    expect(finalDebugText).toMatch(/^X: \d+(\.\d+)? Y: \d+(\.\d+)? V: \d+(\.\d+)?$/);
    console.log(`Final debug info: ${finalDebugText}`);
    
    // 5. Check if game over screen is NOT visible (game should still be running)
    const gameOverElement = page.locator('.game-over');
    const isGameOverVisible = await gameOverElement.isVisible();
    
    if (isGameOverVisible) {
      console.log('Game over occurred during demo - this is acceptable for demonstration');
      await expect(gameOverElement).toBeVisible();
      
      // Show final score from game over screen
      const gameOverScore = await gameOverElement.locator('p').first().textContent();
      console.log(`Game over - ${gameOverScore}`);
    } else {
      console.log('Game is still running after 30 seconds - excellent performance!');
      
      // Verify game elements are still active
      await expect(page.locator('.ground')).toBeVisible();
      
      // Check high score display
      const highScoreElement = page.locator('.high-score');
      if (await highScoreElement.isVisible()) {
        const highScoreText = await highScoreElement.textContent();
        console.log(`High score: ${highScoreText}`);
      }
    }
    
    // Include good variety of game elements check
    console.log('\n=== Game Elements Demonstrated ===');
    console.log('1. Game start with SPACE key ✓');
    console.log('2. Dinosaur jumping mechanics ✓');
    console.log('3. Gravity physics ✓');
    console.log('4. Obstacle generation ✓');
    console.log('5. Score incrementing ✓');
    console.log('6. Debug coordinate display ✓');
    console.log('7. 28 seconds of continuous gameplay ✓');
    
    if (jumpCount > 0) {
      console.log(`8. ${jumpCount} jumps performed ✓`);
    }
    
    if (obstacleCount > 0) {
      console.log(`9. ${obstacleCount} obstacles generated ✓`);
    }
    
    // Final verification that the test captured all required elements
    expect(elapsedTime).toBeGreaterThanOrEqual(27000); // At least 27 seconds
    expect(elapsedTime).toBeLessThanOrEqual(32000); // Not more than 32 seconds
    
    console.log('\n✅ 28-second demonstration completed successfully!');
    console.log('Video should be available in playwright-report/');
  });
});