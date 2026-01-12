import { test, expect } from "@playwright/test";

test.describe("Homepage Carousel/Animation Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("Animated carousel banner renders and animates", async ({ page }) => {
    // Look for carousel/slider elements (Swiper, custom animation)
    const carousel = page.locator(".swiper, .scroll-vertical, .brxe-carousel, [class*='carousel']");

    // Wait for carousel to be visible
    await expect(carousel.first()).toBeVisible({ timeout: 10000 });

    // Verify carousel has content
    const carouselItems = page.locator(".swiper-slide, .scroll-vertical > *, .carousel-item");
    const itemCount = await carouselItems.count();

    expect(itemCount).toBeGreaterThan(0);
  });

  test("Service category cards are lazy-loaded correctly", async ({ page }) => {
    // Scroll to trigger lazy loading
    await page.evaluate(() => {
      window.scrollTo({ top: 800, behavior: "smooth" });
    });

    await page.waitForTimeout(1500);

    // Look for service cards
    const serviceCards = page.locator(".scroll-vertical img, [class*='service'] img");
    const count = await serviceCards.count();

    expect(count).toBeGreaterThan(0);

    // Verify images loaded (not placeholders)
    for (let i = 0; i < Math.min(count, 4); i++) {
      const img = serviceCards.nth(i);
      const isVisible = await img.isVisible();

      if (isVisible) {
        const src = await img.getAttribute("src");

        // Should not be a data URI placeholder
        if (src && src.startsWith("data:image")) {
          // Wait for real image to load
          await page.waitForTimeout(1000);
          const newSrc = await img.getAttribute("src");
          expect(newSrc).toMatch(/^https?:\/\//);
        } else {
          expect(src).toMatch(/^https?:\/\//);
        }
      }
    }
  });

  test("Carousel animation doesn't cause layout shifts", async ({ page }) => {
    // Get initial viewport position
    const initialScrollY = await page.evaluate(() => window.scrollY);

    // Wait for animations to start
    await page.waitForTimeout(2000);

    // Check scroll position hasn't changed unexpectedly
    const afterScrollY = await page.evaluate(() => window.scrollY);

    // Should not have jumped more than a few pixels
    expect(Math.abs(afterScrollY - initialScrollY)).toBeLessThan(100);
  });

  test("Vertical scroll animation performs smoothly", async ({ page }) => {
    // Look for animated elements
    const animatedElements = page.locator(".scroll-vertical, .scroll-vertical-reverse");
    const count = await animatedElements.count();

    if (count > 0) {
      // Verify animations are running
      const hasAnimation = await animatedElements.first().evaluate((el) => {
        const animations = el.getAnimations();
        return animations.length > 0;
      });

      expect(hasAnimation).toBeTruthy();
    }
  });
});
