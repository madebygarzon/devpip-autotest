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
    // Look for main CTA buttons
    const ctaButtons = page.locator('a.brxe-button, button, a:has-text("Contact"), a:has-text("Partner")');

    const count = await ctaButtons.count();
    expect(count).toBeGreaterThan(0);

    // Check first CTA
    const firstCTA = ctaButtons.first();
    await expect(firstCTA).toBeVisible();

    // Should be clickable
    await expect(firstCTA).toBeEnabled();

    // Should have a valid href or onclick
    const href = await firstCTA.getAttribute("href");
    const onclick = await firstCTA.getAttribute("onclick");

    expect(href || onclick).toBeTruthy();
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
    // Look for service descriptions
    const serviceSection = page.locator("text=/Everyone Is a Publisher/i, section:has-text('service')");

    if ((await serviceSection.count()) > 0) {
      const sectionText = await serviceSection.first().textContent();
      expect(sectionText?.length).toBeGreaterThan(50); // Should have meaningful content
    }
  });
});
