import { test, expect } from "@playwright/test";

test.describe("Performance Tests", () => {
  test("Page loads within acceptable time", async ({ page }) => {
    const startTime = Date.now();

    await page.goto("/", {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    const loadTime = Date.now() - startTime;

    // Page should load DOM in under 5 seconds
    expect(loadTime).toBeLessThan(5000);

    console.log(`✅ Page loaded in ${loadTime}ms`);
  });

  test("Core Web Vitals - LCP", async ({ page }) => {
    await page.goto("/");

    // Measure Largest Contentful Paint
    const lcp = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          resolve(lastEntry.renderTime || lastEntry.loadTime);
        }).observe({ entryTypes: ["largest-contentful-paint"] });

        // Timeout after 10 seconds
        setTimeout(() => resolve(0), 10000);
      });
    });

    // LCP should be under 2.5 seconds (good), we'll allow 4 seconds
    expect(lcp).toBeGreaterThan(0);
    expect(lcp).toBeLessThan(4000);

    console.log(`✅ LCP: ${lcp.toFixed(2)}ms`);
  });

  test("No excessive HTTP requests", async ({ page, context }) => {
    const requests: string[] = [];

    page.on("request", (request) => {
      requests.push(request.url());
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    console.log(`📊 Total HTTP requests: ${requests.length}`);

    // Should not make more than 150 requests for initial page load
    expect(requests.length).toBeLessThan(150);
  });

  test("Images are optimized and lazy-loaded", async ({ page }) => {
    await page.goto("/");

    // Get all images
    const images = page.locator("img");
    const count = await images.count();

    let lazyLoadedCount = 0;
    let optimizedCount = 0;

    for (let i = 0; i < Math.min(count, 10); i++) {
      const img = images.nth(i);

      // Check for lazy loading
      const loading = await img.getAttribute("loading");
      if (loading === "lazy") {
        lazyLoadedCount++;
      }

      // Check for WebP or optimized formats
      const src = await img.getAttribute("src");
      if (src && (src.includes(".webp") || src.includes("w=") || src.includes("quality="))) {
        optimizedCount++;
      }
    }

    console.log(`🖼️  Lazy-loaded images: ${lazyLoadedCount}/${Math.min(count, 10)}`);
    console.log(`🖼️  Optimized images: ${optimizedCount}/${Math.min(count, 10)}`);

    // At least some images should be lazy-loaded or optimized
    expect(lazyLoadedCount + optimizedCount).toBeGreaterThan(0);
  });

  test("No JavaScript console errors on page load", async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    page.on("pageerror", (error) => {
      consoleErrors.push(error.message);
    });

    await page.goto("/");
    await page.waitForLoadState("load");

    // Filter out known third-party errors (Google Tag Manager, etc.)
    const criticalErrors = consoleErrors.filter(
      (err) =>
        !err.includes("gtm") &&
        !err.includes("analytics") &&
        !err.includes("facebook") &&
        !err.includes("clarity")
    );

    if (criticalErrors.length > 0) {
      console.log("⚠️  Console errors:", criticalErrors);
    }

    expect(criticalErrors.length).toBe(0);
  });

  test("Resources load successfully (no 404s)", async ({ page }) => {
    const failedRequests: Array<{ url: string; status: number }> = [];

    page.on("response", (response) => {
      if (response.status() >= 400) {
        failedRequests.push({
          url: response.url(),
          status: response.status(),
        });
      }
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    if (failedRequests.length > 0) {
      console.log("❌ Failed requests:", failedRequests);
    }

    // No critical resources should fail
    const criticalFailures = failedRequests.filter(
      (req) => req.status >= 400 && req.status < 500
    );

    expect(criticalFailures.length).toBe(0);
  });

  test("Page is mobile-responsive", async ({ page }) => {
    // Test different viewport sizes
    const viewports = [
      { width: 375, height: 667, name: "iPhone SE" },
      { width: 768, height: 1024, name: "iPad" },
      { width: 1920, height: 1080, name: "Desktop" },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto("/");

      // Check that main content is visible
      const body = page.locator("body");
      await expect(body).toBeVisible();

      // Check for horizontal scrollbar (should not exist)
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      expect(hasHorizontalScroll).toBeFalsy();

      console.log(`✅ ${viewport.name} (${viewport.width}x${viewport.height}) - No horizontal scroll`);
    }
  });
});
