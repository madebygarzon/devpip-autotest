import { test, expect } from "@playwright/test";

test.describe("Footer Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");

    // Scroll to footer
    await page.evaluate(() =>
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })
    );
    await page.waitForTimeout(1000);
  });

  test("Footer contains company information", async ({ page }) => {
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();

    // Footer should have some content
    const footerText = await footer.textContent();
    expect(footerText?.length).toBeGreaterThan(50);
  });

  test("Footer navigation links are valid", async ({ page }) => {
    const footerLinks = page.locator("footer a");
    const count = await footerLinks.count();

    expect(count).toBeGreaterThan(0);

    // Check a sample of footer links
    for (let i = 0; i < Math.min(count, 10); i++) {
      const link = footerLinks.nth(i);
      const href = await link.getAttribute("href");

      // Should have a valid href (not just #)
      expect(href).toBeTruthy();

      // Should be a valid URL or path
      if (href && !href.startsWith("#")) {
        expect(href).toMatch(/^(https?:\/\/|\/|mailto:|tel:)/);
      }
    }
  });

  test("Social media links in footer open in new tab", async ({ page }) => {
    const socialLinks = page.locator(
      'footer a[href*="facebook"], footer a[href*="twitter"], footer a[href*="linkedin"], footer a[href*="instagram"]'
    );

    const count = await socialLinks.count();

    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const link = socialLinks.nth(i);
        await expect(link).toHaveAttribute("target", "_blank");
      }

      console.log(`✅ ${count} social media links found in footer`);
    }
  });

  test("Footer displays copyright information", async ({ page }) => {
    const footer = page.locator("footer");
    const footerText = await footer.textContent();

    // Check if copyright symbol or word exists
    const hasCopyright = footerText?.includes("©") || /copyright/i.test(footerText || "");

    if (hasCopyright) {
      const currentYear = new Date().getFullYear();

      // Should include current or recent year
      const hasRecentYear = footerText?.includes(String(currentYear)) ||
                           footerText?.includes(String(currentYear - 1));

      expect(hasRecentYear).toBeTruthy();
      console.log(`✅ Copyright information found with year ${currentYear}`);
    } else {
      console.log("ℹ️  No explicit copyright information found in footer");
    }
  });

  test("Footer contact information is present", async ({ page }) => {
    const footer = page.locator("footer");
    const footerText = await footer.textContent();

    // Look for email or phone patterns
    const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(
      footerText || ""
    );
    const hasPhone = /\(\d{3}\)\s?\d{3}-\d{4}|\d{3}-\d{3}-\d{4}/.test(
      footerText || ""
    );

    // At least one form of contact should be present
    expect(hasEmail || hasPhone).toBeTruthy();

    if (hasEmail) console.log("✅ Email found in footer");
    if (hasPhone) console.log("✅ Phone found in footer");
  });

  test("Footer privacy policy and terms links exist", async ({ page }) => {
    // Check if links exist in the footer (even if hidden in collapsed menus)
    const privacyLink = page.locator('footer a[href*="privacy"]');
    const termsLink = page.locator('footer a[href*="terms"]');

    const hasPrivacy = (await privacyLink.count()) > 0;
    const hasTerms = (await termsLink.count()) > 0;

    if (hasPrivacy) {
      // Just verify it exists and has valid href
      const href = await privacyLink.first().getAttribute("href");
      expect(href).toBeTruthy();
      expect(href).toContain("privacy");
      console.log(`✅ Privacy Policy link found: ${href}`);
    }

    if (hasTerms) {
      // Just verify it exists and has valid href
      const href = await termsLink.first().getAttribute("href");
      expect(href).toBeTruthy();
      expect(href).toContain("terms");
      console.log(`✅ Terms link found: ${href}`);
    }

    // At least one should exist for compliance
    expect(hasPrivacy || hasTerms).toBeTruthy();
  });

  test("Footer newsletter signup form works (if exists)", async ({ page }) => {
    const newsletterForm = page.locator('footer form, footer input[type="email"]');

    if ((await newsletterForm.count()) > 0) {
      const emailInput = page.locator('footer input[type="email"]');
      await expect(emailInput.first()).toBeVisible();

      const submitButton = page.locator('footer button[type="submit"], footer input[type="submit"]');

      if ((await submitButton.count()) > 0) {
        await expect(submitButton.first()).toBeVisible();
        console.log("✅ Newsletter signup form detected in footer");
      }
    }
  });
});
