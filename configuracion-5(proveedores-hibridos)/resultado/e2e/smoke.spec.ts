import { test, expect } from '@playwright/test';

test.describe('Dinosaur Runner Smoke Tests', () => {
  test('should load the game', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Wait for the app to load
    await page.waitForSelector('app-root');
    
    // Check that the game container is visible
    await expect(page.locator('.game-container')).toBeVisible();
    
    // Check that the game area is present
    await expect(page.locator('.game')).toBeVisible();
    
    // Check that the dinosaur is present
    await expect(page.locator('.dinosaur')).toBeVisible();
    
    // Check that debug info is present with correct format
    const debugInfo = page.locator('.debug-info');
    await expect(debugInfo).toBeVisible();
    
    // Check debug info format: "X: 50 Y: [value] V: [value]"
    const debugText = await debugInfo.textContent();
    expect(debugText).toMatch(/^X: 50 Y: \d+(\.\d+)? V: \d+(\.\d+)?$/);
  });

  test('should start game with SPACE key', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    await page.waitForSelector('app-root');
    
    // Initially, start message should be visible
    const startMessage = page.locator('.start-message');
    await expect(startMessage).toBeVisible();
    
    // Press SPACE to start the game
    await page.keyboard.press('Space');
    
    // Start message should disappear
    await expect(startMessage).not.toBeVisible({ timeout: 5000 });
    
    // Score should be visible and incrementing
    const scoreElement = page.locator('.score');
    await expect(scoreElement).toBeVisible();
    
    // Wait a bit for score to increment
    await page.waitForTimeout(1000);
    
    const scoreText = await scoreElement.textContent();
    expect(scoreText).toContain('Puntuación:');
  });

  test('should make dinosaur jump', async ({ page }) => {
    // Navigate and start game
    await page.goto('/');
    await page.waitForSelector('app-root');
    await page.keyboard.press('Space');
    
    // Wait for game to start
    await page.waitForTimeout(500);
    
    // Get initial Y position
    const debugInfo = page.locator('.debug-info');
    const initialDebugText = await debugInfo.textContent();
    const initialYMatch = initialDebugText?.match(/Y: (\d+(\.\d+)?)/);
    const initialY = initialYMatch ? parseFloat(initialYMatch[1]) : 0;
    
    // Press SPACE to jump
    await page.keyboard.press('Space');
    
    // Wait for jump to take effect
    await page.waitForTimeout(300);
    
    // Get Y position after jump
    const afterJumpDebugText = await debugInfo.textContent();
    const afterJumpYMatch = afterJumpDebugText?.match(/Y: (\d+(\.\d+)?)/);
    const afterJumpY = afterJumpYMatch ? parseFloat(afterJumpYMatch[1]) : 0;
    
    // Y should have increased (jumping up)
    expect(afterJumpY).toBeGreaterThan(initialY);
  });
});