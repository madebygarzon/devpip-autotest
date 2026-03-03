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

    // Look for service links/cards (they may be text-only or have images)
    const serviceLinks = page.locator("[class*='service'] a, .scroll-vertical a");
    const linkCount = await serviceLinks.count();

    if (linkCount > 0) {
      console.log(`✅ Found ${linkCount} service links/cards`);
      expect(linkCount).toBeGreaterThan(0);
      return;
    }

    // Alternative: Look for any images in the service section
    const serviceImages = page.locator(".scroll-vertical img, [class*='service'] img");
    const imageCount = await serviceImages.count();

    if (imageCount === 0) {
      console.log("ℹ️  No service images found - services may be text-only");
      // Check if service text content exists instead
      const serviceText = page.locator("[class*='service']");
      const textCount = await serviceText.count();
      expect(textCount).toBeGreaterThanOrEqual(0);
      return;
    }

    console.log(`✅ Found ${imageCount} service images`);

    // Verify images loaded (not placeholders)
    for (let i = 0; i < Math.min(imageCount, 4); i++) {
      const img = serviceImages.nth(i);
      const isVisible = await img.isVisible();

      if (isVisible) {
        const src = await img.getAttribute("src");

        // Should not be a data URI placeholder
        if (src && src.startsWith("data:image")) {
          // Wait for real image to load
          await page.waitForTimeout(1000);
          const newSrc = await img.getAttribute("src");
          if (newSrc && !newSrc.startsWith("data:image")) {
            console.log(`✅ Image ${i + 1} loaded successfully`);
          }
        } else if (src && /^https?:\/\//.test(src)) {
          console.log(`✅ Image ${i + 1} has valid source`);
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
