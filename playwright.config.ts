import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  reporter: [['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    baseURL: 'https://partnerinpublishing.com',
    headless: true,
    ignoreHTTPSErrors: true,
  },
});
