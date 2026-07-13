# Dinosaur Runner Game - E2E Tests

This directory contains Playwright E2E tests for the Dinosaur Runner game.

## Test Files

- `dinosaur.e2e.ts` - Main E2E test suite for the dinosaur runner game

## Test Coverage

The E2E tests cover:

1. **Initial Game State**
   - Game loads correctly
   - Debug info shows correct format: "X: 50 Y: [value] V: [value]"
   - Dinosaur starts at ground level (Y: 0.0)

2. **Game Controls**
   - SPACE key starts the game
   - SPACE key makes dinosaur jump during gameplay
   - Game responds to ArrowUp key (not tested in E2E but covered in unit tests)

3. **Physics Simulation**
   - Gravity applies correctly (-0.5)
   - Dinosaur jumps with correct strength (12)
   - Dinosaur returns to ground after jumping
   - Dinosaur never goes below ground (Y < 0)

4. **Game Mechanics**
   - Obstacles generate during gameplay
   - Score increments over time
   - Game speed increases with score
   - Collision detection works
   - Game over triggers correctly
   - Game can be restarted after game over

5. **Persistence**
   - High score saves to localStorage
   - High score displays correctly

## Running Tests

### Prerequisites

Make sure Playwright browsers are installed:

```bash
npm run e2e:install
```

### Running Tests

1. **Run all E2E tests:**
   ```bash
   npm run e2e
   ```

2. **Run tests with UI mode:**
   ```bash
   npm run e2e:ui
   ```

3. **Run tests in debug mode:**
   ```bash
   npm run e2e:debug
   ```

4. **Run specific test file:**
   ```bash
   npx playwright test e2e/dinosaur.e2e.ts
   ```

### Test Configuration

- **Base URL:** `http://localhost:4200`
- **Browsers tested:** Chrome, Firefox, Safari
- **Test timeout:** 30 seconds per test
- **Retries:** 0 (2 on CI)

## Test Notes

### Physics Validation
The tests validate the physics fix where:
- Gravity = -0.5 (negative because Y increases downward)
- Jump strength = 12
- Ground Y = 0
- Origin (0,0) is top-left (Y increases downward)

### Debug Info Format
Tests verify debug info shows: `X: 50 Y: [value] V: [value]`

### Time Considerations
Some tests run for extended periods (10-15 seconds) to:
1. Allow obstacles to generate
2. Ensure collisions can happen naturally
3. Validate long-running game stability

### LocalStorage
Tests clear and validate localStorage for high score persistence.

## Troubleshooting

If tests fail:

1. **Ensure Angular dev server is running:**
   ```bash
   npm start
   ```

2. **Check browser dependencies:**
   ```bash
   sudo npx playwright install-deps
   ```

3. **Update Playwright:**
   ```bash
   npm install @playwright/test@latest
   npx playwright install
   ```

4. **Run with trace:**
   ```bash
   npx playwright test --trace on
   ```

## Test Structure

Each test is independent and:
- Navigates to the app fresh
- Waits for app to load
- Tests specific functionality
- Cleans up after itself

Tests use Playwright's page object model and best practices for reliable E2E testing.