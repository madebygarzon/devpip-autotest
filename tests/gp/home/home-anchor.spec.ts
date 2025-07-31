import { test, expect } from "@playwright/test";

test("the PARTNER WITH US button navigates to its section", async ({ page }) => {
  // 1. Load the homepage (uses baseURL defined in playwright.config.ts)
  await page.goto("/");

  // 2. Ensure that the hash is NOT present at the beginning
  expect(page.url()).not.toContain("#brxe-3e26fd");

  // 3. Click the anchor
  await page.locator("#brxe-zabhlg").click();

  await page.waitForTimeout(1000);

  // 4. Wait for the hash to change (#brxe-3e26fd)
  await expect
    .poll(() => page.evaluate(() => window.location.hash))
    .toBe("#brxe-3e26fd");

  // 5. Verify that the target section is visible in the viewport
  //    (boundingBox.top must be within the window height)
  const target = page.locator("#brxe-3e26fd");
  await expect(target).toBeVisible();

  // Extra: “in viewport” assertion ~ the top of the box is in view
  const box = await target.boundingBox();
  const viewportHeight = await page.evaluate(() => window.innerHeight);
  await expect(target).toBeInViewport();
});
``
