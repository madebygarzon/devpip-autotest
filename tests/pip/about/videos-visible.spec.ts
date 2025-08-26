import { test, expect } from "@playwright/test";

test("all about page videos are visible, lazy-loaded, and clickable", async ({ page }) => {
  // 1. Open the About page
  await page.goto("/about/");

  // 2. Scroll to the bottom to trigger lazy-loading of any hidden iframes
  await page.evaluate(() => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  });

  // 3. Wait a moment to allow lazy-loaded YouTube iframes to render
  await page.waitForTimeout(2000);

  // 4. Select all <iframe> elements pointing to YouTube
  const youtubeIframes = page.locator('iframe[src*="youtube.com/embed/"]');
  const count = await youtubeIframes.count();

  // 5. Assert at least one embedded video is present
  expect(count).toBeGreaterThanOrEqual(1);

  // 6. Loop over each detected iframe to verify its visibility + clickability
  for (let i = 0; i < count; i++) {
    const iframe = youtubeIframes.nth(i);

    // Ensure the iframe is visible to the user
    await expect(iframe).toBeVisible();

    // Scroll to the iframe in case it is out of viewport
    await iframe.scrollIntoViewIfNeeded();

    // Simulate a user click to trigger playback
    await iframe.click();

    // Optional: wait a short time for autoplay to begin
    await page.waitForTimeout(1000);
  }
});
