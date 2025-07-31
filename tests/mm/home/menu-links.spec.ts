import { test, expect } from "@playwright/test";

// Extend test timeout to handle slower page loads
test.setTimeout(60_000);

test("Main menu links should be valid and load correctly", async ({ page, context }) => {
  await page.goto("/");

  // Collect all <a> links from both desktop and mobile navigation
  const links = await page.$$eval(
    'nav.bricks-nav-menu-wrapper a, nav.bricks-mobile-menu-wrapper a',
    (elements) =>
      elements
        .map((el) => el.getAttribute("href"))
        .filter((href): href is string => !!href && !href.startsWith("#"))
  );

  const uniqueLinks = [...new Set(links)]; // Remove duplicates

  for (const href of uniqueLinks) {
    console.log(`🔗 Checking: ${href}`);

    // Ensure link uses the correct domain
    expect(href.startsWith("https://partnerinpublishing.com")).toBeTruthy();

    // Open the link in a new page context
    const newPage = await context.newPage();

    const response = await newPage.goto(href, {
      waitUntil: "domcontentloaded",
      timeout: 45000,
    });

    expect(response?.status(), `❌ ${href} returned an unexpected status code`).toBeLessThan(400);

    // Verify that the page has visible content
    await expect(newPage.locator("body")).toBeVisible();

    // Listen for JavaScript errors
    const errors: string[] = [];
    newPage.on("pageerror", (err) => errors.push(err.message));

    await newPage.waitForLoadState("load"); // Wait for the full page load

    expect(errors, `🧨 JavaScript errors found in ${href}`).toEqual([]);

    await newPage.close();
  }
});
