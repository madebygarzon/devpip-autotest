import { test, expect } from "@playwright/test";

test("the PARTNER WITH US button on About navigates to its section", async ({ page }) => {
  // 1. Load the About page (relative to baseURL)
  await page.goto("/about/");

  // 2. Ensure that the hash is NOT present at the beginning
  expect(page.url()).not.toContain("#brxe-4d908f");

  // 3. Click the anchor button
  await page.locator("#brxe-oycedm").click();

  // 4. Wait (smooth scroll animation if any)
  await page.waitForTimeout(1000);

  // 5. Check the hash has changed in the URL
  await expect
    .poll(() => page.evaluate(() => window.location.hash))
    .toBe("#brxe-4d908f");

  // 6. Verify that the target section is visible in the viewport
  const target = page.locator("#brxe-4d908f");
  await expect(target).toBeVisible();

  // Extra: Ensure it's actually inside viewport range
  const box = await target.boundingBox();
  const viewportHeight = await page.evaluate(() => window.innerHeight);
  await expect(target).toBeInViewport();
});
