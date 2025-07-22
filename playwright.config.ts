import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'https://partnerinpublishing.com',
    headless: true,
    ignoreHTTPSErrors: true,
  },
});
