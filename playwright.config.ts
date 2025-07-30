import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  reporter: [['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    headless: true,
    ignoreHTTPSErrors: true,
  },
  projects: [
    {
      name: 'pip',
      use: { baseURL: 'https://partnerinpublishing.com' },
    },
    {
      name: 'gradepotential',
      use: { baseURL: 'https://gradepotentialtutoring.ue1.rapydapps.cloud' },
    },
    {
      name: 'itopia',
      use: { baseURL: 'https://itopia.com' },
    },
    {
      name: 'metricmarine',
      use: { baseURL: 'https://www.metricmarine.com' },
    },
  ],
});
