import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  reporter: [['html', { outputFolder: 'playwright-report', open: 'never' }]],

  outputDir: 'test-results',  

  use: {
    headless: true,
    ignoreHTTPSErrors: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure', 
  },

  projects: [
    {
      name: 'pip',
      use: { baseURL: 'https://st.partnerinpublishing.com' },
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
