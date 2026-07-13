# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: gameover.e2e.spec.ts >> Game Over Screen >> game over shows score
- Location: e2e/gameover.e2e.spec.ts:16:7

# Error details

```
TimeoutError: page.waitForSelector: Timeout 15000ms exceeded.
Call log:
  - waiting for locator('app-gameover') to be visible
    15 × locator resolved to hidden <app-gameover _nghost-ng-c1072189850="" _ngcontent-ng-c158514000="">…</app-gameover>

```

# Page snapshot

```yaml
- generic [ref=e5]:
  - heading "GAME OVER" [level=1] [ref=e6]
  - generic [ref=e7]:
    - generic [ref=e8]: SCORE
    - generic [ref=e9]: "0"
  - generic [ref=e10]:
    - generic [ref=e11]: BEST
    - generic [ref=e12]: "0"
  - button "TRY AGAIN" [ref=e13] [cursor=pointer]
  - button "MENU" [ref=e14] [cursor=pointer]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Game Over Screen', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.goto('/');
  6  |     await page.click('.welcome-container .neon-button');
  7  |     await page.waitForSelector('app-game', { timeout: 5000 });
  8  |   });
  9  | 
  10 |   test('game over screen appears after collision', async ({ page }) => {
  11 |     await page.waitForSelector('app-gameover', { timeout: 15000 });
  12 |     const gameOver = page.locator('app-gameover');
  13 |     await expect(gameOver).toBeVisible();
  14 |   });
  15 | 
  16 |   test('game over shows score', async ({ page }) => {
> 17 |     await page.waitForSelector('app-gameover', { timeout: 15000 });
     |                ^ TimeoutError: page.waitForSelector: Timeout 15000ms exceeded.
  18 |     const scoreSection = page.locator('.gameover-container .score-section');
  19 |     await expect(scoreSection).toBeVisible();
  20 |     await expect(scoreSection).toContainText('SCORE');
  21 |   });
  22 | 
  23 |   test('game over shows high score', async ({ page }) => {
  24 |     await page.waitForSelector('app-gameover', { timeout: 15000 });
  25 |     const scoreSections = page.locator('.gameover-container .score-section');
  26 |     await expect(scoreSections).toHaveCount(2);
  27 |     await expect(scoreSections.nth(1)).toContainText('BEST');
  28 |   });
  29 | 
  30 |   test('game over has restart button', async ({ page }) => {
  31 |     await page.waitForSelector('app-gameover', { timeout: 15000 });
  32 |     const retryButton = page.locator('.gameover-container .neon-button.retry');
  33 |     await expect(retryButton).toBeVisible();
  34 |     await expect(retryButton).toHaveText('TRY AGAIN');
  35 |   });
  36 | 
  37 |   test('restart button navigates to game', async ({ page }) => {
  38 |     await page.waitForSelector('app-gameover', { timeout: 15000 });
  39 |     await page.click('.gameover-container .neon-button.retry');
  40 |     await expect(page.locator('app-game')).toBeVisible();
  41 |     await expect(page.locator('.game-canvas')).toBeVisible();
  42 |   });
  43 | 
  44 |   test('menu button navigates to welcome', async ({ page }) => {
  45 |     await page.waitForSelector('app-gameover', { timeout: 15000 });
  46 |     await page.click('.gameover-container .neon-button.menu');
  47 |     await expect(page.locator('app-welcome')).toBeVisible();
  48 |     await expect(page.locator('.welcome-container .title')).toHaveText('DINO RUNNER');
  49 |   });
  50 | 
  51 |   test('high score persists after restart', async ({ page }) => {
  52 |     await page.waitForSelector('app-gameover', { timeout: 15000 });
  53 |     const highScore = await page.locator('.gameover-container .score-section').nth(1).textContent() || '0';
  54 |     const highScoreValue = parseInt(highScore.replace(/\D/g, ''), 10) || 0;
  55 |     await page.click('.gameover-container .neon-button.retry');
  56 |     await page.waitForSelector('app-game', { timeout: 5000 });
  57 |     await page.waitForSelector('app-gameover', { timeout: 15000 });
  58 |     const newHighScore = await page.locator('.gameover-container .score-section').nth(1).textContent() || '0';
  59 |     const newHighScoreValue = parseInt(newHighScore.replace(/\D/g, ''), 10) || 0;
  60 |     expect(newHighScoreValue).toBeGreaterThanOrEqual(highScoreValue);
  61 |   });
  62 | });
  63 | 
```