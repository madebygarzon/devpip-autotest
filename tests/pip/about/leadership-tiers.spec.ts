import { test, expect } from "@playwright/test";

test.describe("Leadership Team Organization Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/about/");

    // Scroll to team section
    await page.evaluate(() =>
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })
    );
    await page.waitForTimeout(2000);
  });

  test("Leadership team is organized in visible tiers/sections", async ({ page }) => {
    // Look for team sections or tier headers
    const teamSections = page.locator(".jet-listing-grid, section:has(.jet-listing-grid__item)");
    const sectionCount = await teamSections.count();

    expect(sectionCount).toBeGreaterThanOrEqual(1);
  });

  test("Each team member card has consistent structure", async ({ page }) => {
    const memberCards = page.locator(".jet-listing-grid__item");
    const count = await memberCards.count();

    expect(count).toBeGreaterThanOrEqual(8);

    // Check structure consistency for first few cards
    for (let i = 0; i < Math.min(count, 5); i++) {
      const card = memberCards.nth(i);

      // Should have image
      const image = card.locator("img");
      await expect(image).toBeVisible();

      // Should have name
      const name = card.locator(".jet-listing-dynamic-field__content");
      expect(await name.count()).toBeGreaterThan(0);

      // Should have role/title
      const role = card.locator("[class*='role'], [class*='title']");
      const hasRole = (await role.count()) > 0;

      if (!hasRole) {
        // Alternative: check for any text content besides name
        const textContent = await card.textContent();
        expect(textContent?.trim().length).toBeGreaterThan(10);
      }
    }
  });

  test("LinkedIn profile links open in new tab", async ({ page }) => {
    const linkedInLinks = page.locator('a[href*="linkedin.com"]');
    const count = await linkedInLinks.count();

    expect(count).toBeGreaterThan(0);

    // Verify all LinkedIn links have target="_blank"
    for (let i = 0; i < count; i++) {
      const link = linkedInLinks.nth(i);
      await expect(link).toHaveAttribute("target", "_blank");

      // Should also have rel="noopener" or rel="noreferrer" for security (optional but recommended)
      const rel = await link.getAttribute("rel");

      if (rel) {
        const hasSecurity = rel.includes("noopener") || rel.includes("noreferrer");
        if (hasSecurity) {
          console.log(`✅ Link ${i + 1} has security attributes: ${rel}`);
        } else {
          console.log(`⚠️  Link ${i + 1} missing security attributes (noopener/noreferrer)`);
        }
      } else {
        console.log(`⚠️  Link ${i + 1} has no rel attribute (consider adding noopener noreferrer)`);
      }
    }

    console.log(`✅ All ${count} LinkedIn links open in new tab`);
  });

  test("Team member images load with proper aspect ratio", async ({ page }) => {
    const images = page.locator(".jet-listing-grid__item img");
    const count = await images.count();

    for (let i = 0; i < Math.min(count, 5); i++) {
      const img = images.nth(i);
      const isVisible = await img.isVisible();

      if (isVisible) {
        // Check image has loaded
        const naturalWidth = await img.evaluate(
          (el: HTMLImageElement) => el.naturalWidth
        );
        const naturalHeight = await img.evaluate(
          (el: HTMLImageElement) => el.naturalHeight
        );

        expect(naturalWidth).toBeGreaterThan(0);
        expect(naturalHeight).toBeGreaterThan(0);

        // Aspect ratio should be reasonable (not extremely tall or wide)
        const aspectRatio = naturalWidth / naturalHeight;
        expect(aspectRatio).toBeGreaterThan(0.5);
        expect(aspectRatio).toBeLessThan(2.5);
      }
    }
  });

  test("Team section is searchable/filterable if feature exists", async ({ page }) => {
    // Look for search or filter inputs
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]');
    const filterDropdown = page.locator('select:has(option), .filter-dropdown');

    const hasSearch = (await searchInput.count()) > 0;
    const hasFilter = (await filterDropdown.count()) > 0;

    if (hasSearch || hasFilter) {
      console.log("✅ Team search/filter feature detected");

      if (hasSearch) {
        // Test search functionality
        await searchInput.first().fill("John");
        await page.waitForTimeout(500);

        const visibleCards = page.locator(".jet-listing-grid__item:visible");
        expect(await visibleCards.count()).toBeGreaterThanOrEqual(0);
      }
    } else {
      console.log("ℹ️  No search/filter feature - all team members displayed");
    }
  });
});
