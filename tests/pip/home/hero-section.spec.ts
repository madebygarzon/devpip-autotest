import { test, expect } from "@playwright/test";

test.describe("Hero Section Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("Hero section displays correctly with headline and CTA", async ({ page }) => {
    // Check hero headline is visible
    const headline = page.locator("text=/Get Your Story Told/i");
    await expect(headline).toBeVisible();

    // Verify subheading about EdTech partnership
    const subheading = page.locator("text=/full-service.*EdTech/i");
    await expect(subheading).toBeVisible();

    // Verify "PARTNER WITH US" CTA button exists and is clickable
    const ctaButton = page.locator('a:has-text("PARTNER WITH US")');
    await expect(ctaButton).toBeVisible();
    await expect(ctaButton).toHaveAttribute("href", /.+/); // Should have a valid href
  });

  test("Hero CTA button is interactive", async ({ page }) => {
    const ctaButton = page.locator('a:has-text("PARTNER WITH US")');

    // Check button is enabled and clickable
    await expect(ctaButton).toBeEnabled();

    // Verify button has proper styling (should be visible and styled)
    const backgroundColor = await ctaButton.evaluate((el) =>
      window.getComputedStyle(el).backgroundColor
    );
    expect(backgroundColor).not.toBe("rgba(0, 0, 0, 0)"); // Should have a background color
  });

  test("Hero background images load correctly", async ({ page }) => {
    // Wait for any background images to load
    await page.waitForLoadState("load");

    // Check for background images in hero section
    const heroSection = page.locator("section").first(); // Assuming hero is first section
    await expect(heroSection).toBeVisible();

    // Verify no broken images (check for common error states)
    const images = page.locator("img");
    const count = await images.count();

    for (let i = 0; i < Math.min(count, 5); i++) {
      // Check first 5 images in hero area
      const img = images.nth(i);
      const isVisible = await img.isVisible();

      if (isVisible) {
        const naturalWidth = await img.evaluate(
          (el: HTMLImageElement) => el.naturalWidth
        );
        expect(naturalWidth).toBeGreaterThan(0);
      }
    }
  });
});
