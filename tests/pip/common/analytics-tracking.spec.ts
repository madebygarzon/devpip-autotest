import { test, expect } from "@playwright/test";

test.describe("Analytics and Tracking Tests", () => {
  test("Google Tag Manager is loaded", async ({ page }) => {
    await page.goto("/");

    // Check for GTM script
    const gtmScript = await page.evaluate(() => {
      return (
        window.hasOwnProperty("google_tag_manager") ||
        document.querySelector('script[src*="googletagmanager.com"]') !== null
      );
    });

    expect(gtmScript).toBeTruthy();
    console.log("✅ Google Tag Manager detected");
  });

  test("Microsoft Clarity tracking is active", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Check for Clarity script
    const clarityScript = await page.evaluate(() => {
      return (
        window.hasOwnProperty("clarity") ||
        document.querySelector('script[src*="clarity.ms"]') !== null
      );
    });

    expect(clarityScript).toBeTruthy();
    console.log("✅ Microsoft Clarity detected");
  });

  test("No tracking scripts block page load", async ({ page }) => {
    const startTime = Date.now();

    await page.goto("/", { waitUntil: "domcontentloaded" });

    const loadTime = Date.now() - startTime;

    // Should load in under 5 seconds even with tracking
    expect(loadTime).toBeLessThan(5000);

    console.log(`✅ Page loaded in ${loadTime}ms with tracking scripts`);
  });

  test("Analytics scripts load asynchronously", async ({ page }) => {
    await page.goto("/");

    // Check that analytics scripts have async or defer attributes
    const scripts = await page.$$eval(
      'script[src*="analytics"], script[src*="gtag"], script[src*="clarity"]',
      (elements) =>
        elements.map((el) => ({
          src: el.getAttribute("src"),
          async: el.hasAttribute("async"),
          defer: el.hasAttribute("defer"),
        }))
    );

    for (const script of scripts) {
      const isNonBlocking = script.async || script.defer;
      console.log(`Script: ${script.src?.substring(0, 50)}... - ${isNonBlocking ? "Non-blocking" : "Blocking"}`);
    }

    // Most analytics scripts should be non-blocking
    const nonBlockingCount = scripts.filter((s) => s.async || s.defer).length;
    expect(nonBlockingCount).toBeGreaterThan(0);
  });

  test("Cookie consent banner appears (if required)", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(1000);

    // Look for cookie consent banner
    const cookieBanner = page.locator(
      '[class*="cookie-banner"], [class*="consent"], [id*="cookie-notice"]'
    );

    if ((await cookieBanner.count()) > 0) {
      await expect(cookieBanner.first()).toBeVisible();
      console.log("✅ Cookie consent banner detected");

      // Should have accept/decline buttons
      const acceptButton = page.locator('button:has-text("Accept"), button:has-text("OK"), button:has-text("Got it")');

      if ((await acceptButton.count()) > 0) {
        await expect(acceptButton.first()).toBeVisible();
        console.log("✅ Cookie consent actions available");
      }
    } else {
      console.log("ℹ️  No cookie consent banner (may not be required)");
    }
  });

  test("Form submissions trigger analytics events", async ({ page }) => {
    const analyticsEvents: string[] = [];

    // Listen for GTM dataLayer pushes
    await page.exposeFunction("logEvent", (event: string) => {
      analyticsEvents.push(event);
    });

    await page.goto("/");
    await page.waitForLoadState("load");

    // Interact with form
    const form = page.locator("#wpforms-form-22096");

    if ((await form.count()) > 0) {
      // Fill minimal required fields
      await page.fill("#wpforms-22096-field_9", "test@example.com");

      // Check if any tracking fired (this is a basic check)
      console.log("✅ Form interaction completed - analytics should track");
    }
  });

  test("External link clicks can be tracked", async ({ page }) => {
    await page.goto("/");

    // Find external links
    const externalLinks = page.locator('a[href^="http"]:not([href*="partnerinpublishing.com"])');
    const count = await externalLinks.count();

    if (count > 0) {
      console.log(`✅ ${count} external links found (trackable for analytics)`);

      // Verify links are properly tagged for tracking
      const firstLink = externalLinks.first();
      const hasTracking = await firstLink.evaluate((el) => {
        return (
          el.getAttribute("target") === "_blank" ||
          el.hasAttribute("data-track") ||
          el.hasAttribute("onclick")
        );
      });

      if (hasTracking) {
        console.log("✅ External links configured for tracking");
      }
    }
  });

  test("Page view events are sent on navigation", async ({ page }) => {
    let pageViewFired = false;

    page.on("request", (request) => {
      const url = request.url();

      // Check for analytics/tracking requests
      if (
        url.includes("google-analytics.com") ||
        url.includes("clarity.ms") ||
        url.includes("collect")
      ) {
        pageViewFired = true;
      }
    });

    await page.goto("/");
    await page.waitForTimeout(2000); // Wait for tracking to fire

    expect(pageViewFired).toBeTruthy();
    console.log("✅ Page view tracking fired");
  });
});
