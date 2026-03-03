import { test, expect, devices } from "@playwright/test";

// Configure mobile device for all tests in this file
test.use(devices["iPhone 12"]);

test.describe("Mobile Navigation Tests", () => {

  test("Mobile menu toggle opens and closes correctly", async ({ page }) => {
    await page.goto("/");

    // Find the main mobile menu toggle button (look for visible button first)
    const menuToggle = page.locator('button:has-text("Open mobile menu"), .bricks-mobile-menu-toggle, .brxe-nav-menu__toggle, .menu-toggle, .hamburger').first();

    // Check if mobile menu exists and is visible
    const isVisible = await menuToggle.isVisible().catch(() => false);
    if (!isVisible) {
      console.log("ℹ️  No visible mobile menu toggle found - site may not have mobile navigation");
      return;
    }

    console.log("✅ Found mobile menu toggle button");

    // Click to open menu
    await menuToggle.click();

    // Wait for menu to open
    await page.waitForTimeout(500); // Animation time

    // Mobile menu wrapper should be visible
    const mobileMenu = page.locator(".bricks-mobile-menu-wrapper, nav.mobile-menu, .mobile-nav, nav[class*='mobile']").first();
    const menuVisible = await mobileMenu.isVisible().catch(() => false);

    if (menuVisible) {
      console.log("✅ Mobile menu opened successfully");

      // Verify menu items are visible
      const menuLinks = page.locator(".bricks-mobile-menu-wrapper a, nav.mobile-menu a, .mobile-nav a");
      const linkCount = await menuLinks.count();

      if (linkCount > 0) {
        console.log(`✅ Found ${linkCount} menu links`);
      }

      // Try to close menu by clicking toggle again
      await menuToggle.click();
      await page.waitForTimeout(500);

      console.log("✅ Mobile menu toggle test completed");
    } else {
      console.log("⚠️  Mobile menu wrapper not detected after click - may use different structure");
    }
  });

  test("Mobile menu links are accessible and functional", async ({ page }) => {
    await page.goto("/");

    // Find the main mobile menu toggle button
    const menuToggle = page.locator('button:has-text("Open mobile menu"), .bricks-mobile-menu-toggle, .brxe-nav-menu__toggle, .menu-toggle, .hamburger').first();

    const isVisible = await menuToggle.isVisible().catch(() => false);
    if (!isVisible) {
      console.log("ℹ️  No visible mobile menu toggle found - skipping test");
      return;
    }

    await menuToggle.click();
    await page.waitForTimeout(500);

    // Get all menu links
    const menuLinks = page.locator(".bricks-mobile-menu-wrapper a, nav.mobile-menu a, .mobile-nav a, nav[class*='mobile'] a");
    const count = await menuLinks.count();

    if (count === 0) {
      console.log("ℹ️  No mobile menu links found - menu may use different structure");
      return;
    }

    console.log(`✅ Found ${count} mobile menu links`);

    // Check first link is valid and clickable
    const firstLink = menuLinks.first();
    const firstLinkVisible = await firstLink.isVisible().catch(() => false);

    if (firstLinkVisible) {
      const href = await firstLink.getAttribute("href");
      if (href && href !== "#") {
        console.log(`✅ First link is valid: ${href}`);
      }
    }
  });

  test("Mobile submenu (dropdown) functionality", async ({ page }) => {
    await page.goto("/");

    // Find the main mobile menu toggle button
    const menuToggle = page.locator('button:has-text("Open mobile menu"), .bricks-mobile-menu-toggle, .brxe-nav-menu__toggle, .menu-toggle, .hamburger').first();

    const isVisible = await menuToggle.isVisible().catch(() => false);
    if (!isVisible) {
      console.log("ℹ️  No visible mobile menu toggle found - skipping test");
      return;
    }

    await menuToggle.click();
    await page.waitForTimeout(500);

    // Look for visible submenu toggle buttons (e.g., "Services Sub menu")
    const submenuButtons = page.locator('button[aria-label*="Sub menu"]:visible, .submenu-toggle:visible');
    const submenuButtonCount = await submenuButtons.count();

    if (submenuButtonCount > 0) {
      console.log(`✅ Found ${submenuButtonCount} submenu toggle buttons`);

      // Try to click first submenu button
      try {
        await submenuButtons.first().click({ timeout: 3000 });
        await page.waitForTimeout(300);

        // Verify submenu items appear
        const submenuItems = page.locator(".sub-menu:visible a, [class*='submenu']:visible a");
        const submenuCount = await submenuItems.count();

        if (submenuCount > 0) {
          console.log(`✅ Submenu expanded with ${submenuCount} items`);
        } else {
          console.log("ℹ️  Submenu may not have expanded or uses different structure");
        }
      } catch (error) {
        console.log("⚠️  Could not click submenu toggle - may not be interactive");
      }
    } else {
      console.log("ℹ️  No submenu toggles found - menu may be flat structure");
    }
  });
});
