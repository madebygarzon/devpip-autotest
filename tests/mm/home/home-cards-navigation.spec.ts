import { test, expect } from '@playwright/test';

test.describe('Service cards redirect correctly', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  const cards = [
    {
      id: '#brxe-sqxgai',
      url: 'https://partnerinpublishing.com/services/brand-awareness/',
    },
    {
      id: '#brxe-pocmop',
      url: 'https://partnerinpublishing.com/services/business-strategy-development/',
    },
    {
      id: '#brxe-dlvkgz',
      url: 'https://partnerinpublishing.com/services/digital-marketing/',
    },
    {
      id: '#brxe-cjvtps',
      url: 'https://partnerinpublishing.com/services/innovation-marketplace/',
    },
    {
      id: '#brxe-cmktmc',
      url: 'https://partnerinpublishing.com/services/market-research/',
    },
    {
      id: '#brxe-dfhnam',
      url: 'https://partnerinpublishing.com/talent-search-group/',
    },
    {
      id: '#brxe-ujzrxh',
      url: 'https://partnerinpublishing.com/services/video-production-services/',
    },
    {
      id: '#brxe-mgehjn',
      url: 'https://partnerinpublishing.com/services/web-development-services/',
    },
  ];

  for (const card of cards) {
    test(`Card ${card.id} navigates correctly to ${card.url}`, async ({ page }) => {
      const link = page.locator(card.id);

      // Ensure the link exists and has the correct href
      await expect(link).toHaveAttribute('href', card.url);

      // Open in a new tab so it doesn't interrupt the current flow
      const [newPage] = await Promise.all([
        page.context().waitForEvent('page'),
        link.click({ button: 'middle' }), // middle click: opens in a new tab
      ]);

      // Wait for the new page to load
      await newPage.waitForLoadState('load');
      await expect(newPage).toHaveURL(card.url);
      await newPage.close();
    });
  }
});
