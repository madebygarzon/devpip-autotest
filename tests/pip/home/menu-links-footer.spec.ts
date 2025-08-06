import { test, expect } from "@playwright/test";

const BASE_URL = "/";

test("Validate footer menu links open without visual or HTTP errors", async ({ page }) => {
  // Go to homepage
  await page.goto(BASE_URL);

  // Get all footer links
  const footerLinks = page.locator("footer a, #brxe-hniiyd a");
  const count = await footerLinks.count();

  console.log(`Found ${count} footer links.`);

  for (let i = 0; i < count; i++) {
    const linkElement = footerLinks.nth(i);
    const href = await linkElement.getAttribute("href");

    // Skip empty or non-http links
    if (!href || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("#")) {
      console.log(`Skipping non-http link: ${href}`);
      continue;
    }

    console.log(`Checking link: ${href}`);

    // Open the link in a new tab/page
    const newPage = await page.context().newPage();
    const response = await newPage.goto(href, { waitUntil: "domcontentloaded" });

    // Check HTTP status
    expect(response?.status(), `HTTP error for ${href}`).toBeLessThan(400);

    // Check page content for common error texts
    const pageText = await newPage.textContent("body");

    const errorIndicators = [
      "404",
      "Page Not Found",
      "Not Found",
      "Error",
      "An error occurred",
      "Oops"
    ];

    for (const indicator of errorIndicators) {
      expect(
        pageText?.toLowerCase().includes(indicator.toLowerCase()),
        `Link ${href} seems broken - contains: "${indicator}"`
      ).toBeFalsy();
    }

    await newPage.close();
  }
});
