import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.e2e.spec.ts',
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:4200',
    timeout: 120000,
    reuseExistingServer: !process.env.CI
  },
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
  },
});
