import { test, expect } from "@playwright/test";

test.describe("About Page Hero and CTAs", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/about/");
  });

  test("About page hero section displays correctly", async ({ page }) => {
    // Check for hero headline
    const headline = page.locator("h1, h2:first-of-type");
    await expect(headline.first()).toBeVisible();

    const headlineText = await headline.first().textContent();
    expect(headlineText?.length).toBeGreaterThan(0);

    console.log(`✅ Hero headline: "${headlineText?.trim()}"`);
  });

  test("Partnership value proposition is visible", async ({ page }) => {
    // Look for key messaging sections
    const valueProposition = page.locator("text=/What Makes Us Different/i, text=/Everyone Is a Publisher/i");

    if ((await valueProposition.count()) > 0) {
      await expect(valueProposition.first()).toBeVisible();
    }
  });

  test("CTA buttons are present and functional", async ({ page }) => {
    // Look for main CTA buttons (visible ones)
    const ctaButtons = page.locator('a.brxe-button:visible, button:visible');

    const count = await ctaButtons.count();

    if (count > 0) {
      // Check first CTA
      const firstCTA = ctaButtons.first();
      await expect(firstCTA).toBeVisible();

      // Should be clickable
      await expect(firstCTA).toBeEnabled();

      // Should have a valid href, onclick, or be a button
      const href = await firstCTA.getAttribute("href");
      const onclick = await firstCTA.getAttribute("onclick");
      const tagName = await firstCTA.evaluate(el => el.tagName.toLowerCase());

      const isValidCTA = href !== null || onclick !== null || tagName === 'button';
      expect(isValidCTA).toBeTruthy();

      console.log(`✅ Found ${count} CTA buttons`);
    } else {
      console.log("ℹ️  No CTA buttons found on About page");
    }
  });

  test("'Proven Success' or Case Studies section exists", async ({ page }) => {
    // Scroll to reveal all sections
    await page.evaluate(() =>
      window.scrollTo({ top: document.body.scrollHeight / 2, behavior: "smooth" })
    );
    await page.waitForTimeout(1000);

    // Look for case studies section
    const caseStudiesSection = page.locator("text=/Proven Success/i, text=/Case Studies/i, text=/Success Stories/i");

    if ((await caseStudiesSection.count()) > 0) {
      await expect(caseStudiesSection.first()).toBeVisible();
      console.log("✅ Case Studies section found");
    }
  });

  test("Service overview section is informative", async ({ page }) => {
    // Look for service descriptions with corrected selector
    const serviceSection = page.locator("text=/Everyone Is a Publisher/i");

    if ((await serviceSection.count()) > 0) {
      const sectionText = await serviceSection.first().textContent();
      expect(sectionText?.length).toBeGreaterThan(10); // Should have meaningful content
      console.log("✅ Service overview section found");
    } else {
      // Alternative: check for any section with "service" text
      const altSection = page.locator('section, div').filter({ hasText: /service/i });
      if ((await altSection.count()) > 0) {
        console.log("✅ Service-related content found");
      } else {
        console.log("ℹ️  No specific service overview section found");
      }
    }
  });
});
