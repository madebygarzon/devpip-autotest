import { test, expect, devices } from "@playwright/test";

test.describe("Mobile Navigation Tests", () => {
  test.use(devices["iPhone 12"]);

  test("Mobile menu toggle opens and closes correctly", async ({ page }) => {
    await page.goto("/");

    // Find mobile menu toggle button
    const menuToggle = page.locator(".bricks-mobile-menu-toggle, button[aria-label*='menu'], .brxe-nav-menu__toggle");

    // Menu toggle should be visible on mobile
    await expect(menuToggle).toBeVisible();

    // Click to open menu
    await menuToggle.click();

    // Wait for menu to open
    await page.waitForTimeout(500); // Animation time

    // Mobile menu wrapper should be visible
    const mobileMenu = page.locator(".bricks-mobile-menu-wrapper, nav.mobile-menu");
    await expect(mobileMenu).toBeVisible();

    // Verify menu items are visible
    const menuLinks = page.locator(".bricks-mobile-menu-wrapper a");
    const linkCount = await menuLinks.count();
    expect(linkCount).toBeGreaterThan(0);

    // Close menu by clicking toggle again
    await menuToggle.click();
    await page.waitForTimeout(500);

    // Menu should be hidden (or have aria-hidden="true")
    const isHidden = await mobileMenu.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return (
        style.display === "none" ||
        style.visibility === "hidden" ||
        el.getAttribute("aria-hidden") === "true"
      );
    });
    expect(isHidden).toBeTruthy();
  });

  test("Mobile menu links are accessible and functional", async ({ page }) => {
    await page.goto("/");

    // Open mobile menu
    const menuToggle = page.locator(".bricks-mobile-menu-toggle, button[aria-label*='menu'], .brxe-nav-menu__toggle");
    await menuToggle.click();
    await page.waitForTimeout(500);

    // Get all menu links
    const menuLinks = page.locator(".bricks-mobile-menu-wrapper a, nav.mobile-menu a");
    const count = await menuLinks.count();

    // Verify at least main navigation items exist
    expect(count).toBeGreaterThan(3);

    // Check first link is valid and clickable
    const firstLink = menuLinks.first();
    await expect(firstLink).toBeVisible();

    const href = await firstLink.getAttribute("href");
    expect(href).toBeTruthy();
    expect(href).not.toBe("#");
  });

  test("Mobile submenu (dropdown) functionality", async ({ page }) => {
    await page.goto("/");

    // Open mobile menu
    const menuToggle = page.locator(".bricks-mobile-menu-toggle, button[aria-label*='menu']");
    await menuToggle.click();
    await page.waitForTimeout(500);

    // Look for submenu toggles (Services, About, etc.)
    const submenuToggles = page.locator(".bricks-mobile-menu-wrapper .menu-item-has-children > a, .submenu-toggle");

    const toggleCount = await submenuToggles.count();

    if (toggleCount > 0) {
      // Click first submenu toggle
      await submenuToggles.first().click();
      await page.waitForTimeout(300);

      // Verify submenu items appear
      const submenuItems = page.locator(".bricks-mobile-menu-wrapper .sub-menu a, .submenu a");
      const submenuCount = await submenuItems.count();

      expect(submenuCount).toBeGreaterThan(0);
    }
  });
});
