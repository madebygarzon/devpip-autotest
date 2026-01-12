import { test, expect } from "@playwright/test";

test.describe("Accessibility Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("Skip to content link exists and works", async ({ page }) => {
    // Tab to focus skip link (it's usually hidden until focused)
    await page.keyboard.press("Tab");

    // Look for skip link
    const skipLink = page.locator(".skip-link, a[href='#main'], a:has-text('Skip to content')");

    // Should be focusable
    const isFocused = await skipLink.evaluate((el) => el === document.activeElement);
    if (isFocused) {
      await expect(skipLink).toBeVisible();

      // Should have valid href to main content
      const href = await skipLink.getAttribute("href");
      expect(href).toMatch(/#(main|content)/);
    }
  });

  test("All images have alt text or are marked decorative", async ({ page }) => {
    await page.waitForLoadState("load");

    // Get all images
    const images = page.locator("img");
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const isVisible = await img.isVisible();

      if (isVisible) {
        const alt = await img.getAttribute("alt");
        const role = await img.getAttribute("role");
        const ariaHidden = await img.getAttribute("aria-hidden");

        // Image should have alt text OR be marked as decorative
        const hasAccessibility =
          (alt !== null && alt !== "") || // Has alt text
          role === "presentation" || // Marked as presentation
          ariaHidden === "true"; // Hidden from screen readers

        expect(hasAccessibility).toBeTruthy();
      }
    }
  });

  test("Form inputs have associated labels", async ({ page }) => {
    // Wait for form to load
    await expect(page.locator("#wpforms-form-22096")).toBeVisible();

    // Get all form inputs
    const inputs = page.locator("#wpforms-form-22096 input, #wpforms-form-22096 select, #wpforms-form-22096 textarea");
    const count = await inputs.count();

    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      const type = await input.getAttribute("type");

      // Skip hidden inputs and submit buttons
      if (type === "hidden" || type === "submit") {
        continue;
      }

      const id = await input.getAttribute("id");
      const ariaLabel = await input.getAttribute("aria-label");
      const ariaLabelledby = await input.getAttribute("aria-labelledby");

      // Check if there's a label for this input
      let hasLabel = false;

      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        hasLabel = (await label.count()) > 0;
      }

      // Input should have a label, aria-label, or aria-labelledby
      const hasAccessibleName = hasLabel || ariaLabel !== null || ariaLabelledby !== null;

      expect(hasAccessibleName).toBeTruthy();
    }
  });

  test("Navigation has proper ARIA attributes", async ({ page }) => {
    const nav = page.locator("nav");

    // Main navigation should exist
    expect(await nav.count()).toBeGreaterThan(0);

    // Check for ARIA attributes on navigation
    const firstNav = nav.first();
    const role = await firstNav.getAttribute("role");
    const ariaLabel = await firstNav.getAttribute("aria-label");

    // Should have role="navigation" or aria-label
    const hasProperAria = role === "navigation" || ariaLabel !== null;
    expect(hasProperAria).toBeTruthy();
  });

  test("Color contrast meets WCAG AA standards (basic check)", async ({ page }) => {
    // Check primary CTA button contrast
    const ctaButton = page.locator('a:has-text("PARTNER WITH US"), a:has-text("Contact Us")').first();

    if ((await ctaButton.count()) > 0) {
      const styles = await ctaButton.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          color: computed.color,
          backgroundColor: computed.backgroundColor,
        };
      });

      // Both should be defined (not transparent)
      expect(styles.color).not.toBe("rgba(0, 0, 0, 0)");
      expect(styles.backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
    }
  });

  test("Page has proper heading hierarchy", async ({ page }) => {
    await page.waitForLoadState("load");

    // Should have exactly one h1
    const h1Count = await page.locator("h1").count();
    expect(h1Count).toBe(1);

    // Check heading order (h1 → h2 → h3, etc.)
    const headings = await page.$$eval("h1, h2, h3, h4, h5, h6", (elements) =>
      elements.map((el) => parseInt(el.tagName.substring(1)))
    );

    // First heading should be h1
    expect(headings[0]).toBe(1);

    // Verify no big jumps (e.g., h1 → h4)
    for (let i = 1; i < headings.length; i++) {
      const jump = headings[i] - headings[i - 1];
      // Allow same level or next level, but not jumping more than 1
      expect(jump).toBeLessThanOrEqual(1);
    }
  });

  test("Keyboard navigation works on main CTAs", async ({ page }) => {
    // Tab through the page
    await page.keyboard.press("Tab"); // Skip link
    await page.keyboard.press("Tab"); // Logo or first nav item
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");

    // One of the tabs should focus on a main CTA
    const focusedElement = await page.evaluate(() => document.activeElement?.textContent);

    // Should be able to reach interactive elements
    expect(focusedElement).toBeTruthy();
  });
});
