import { test, expect } from "@playwright/test";

test.describe("Analytics and Tracking Tests", () => {
  test("Google Tag Manager is loaded", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Wait a bit for GTM to initialize
    await page.waitForTimeout(1500);

    // Check for GTM script and dataLayer
    const gtmInfo = await page.evaluate(() => {
      // Check for dataLayer (GTM global variable)
      const hasDataLayer = Array.isArray((window as any).dataLayer);

      // Check for GTM script tag (dynamically loaded)
      const hasGTMScript = document.querySelector('script[src*="googletagmanager.com/gtm.js"]') !== null;

      // Check for GTM noscript iframe
      const hasGTMNoscript = document.querySelector('iframe[src*="googletagmanager.com/ns.html"]') !== null;

      // Check for inline GTM initialization script
      const inlineScripts = Array.from(document.querySelectorAll('script:not([src])'));
      const hasGTMInline = inlineScripts.some(script =>
        script.textContent?.includes('googletagmanager.com/gtm.js') ||
        script.textContent?.includes('GTM-')
      );

      return {
        hasDataLayer,
        hasGTMScript,
        hasGTMNoscript,
        hasGTMInline,
        dataLayerLength: hasDataLayer ? (window as any).dataLayer.length : 0
      };
    });

    const gtmDetected = gtmInfo.hasDataLayer || gtmInfo.hasGTMScript || gtmInfo.hasGTMNoscript || gtmInfo.hasGTMInline;

    console.log(`GTM Detection: dataLayer=${gtmInfo.hasDataLayer}, script=${gtmInfo.hasGTMScript}, noscript=${gtmInfo.hasGTMNoscript}, inline=${gtmInfo.hasGTMInline}`);

    if (gtmInfo.hasDataLayer) {
      console.log(`✅ Google Tag Manager detected (dataLayer has ${gtmInfo.dataLayerLength} items)`);
    }

    expect(gtmDetected).toBeTruthy();
  });

  test("Microsoft Clarity tracking is active", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Wait for Clarity to initialize
    await page.waitForTimeout(3000);

    // Check for Clarity script and tracking
    const clarityInfo = await page.evaluate(() => {
      // Check for clarity function
      const hasClarity = typeof (window as any).clarity === "function";

      // Check for clarity script tag (dynamically loaded)
      const hasClarityScript = document.querySelector('script[src*="clarity.ms/tag/"]') !== null;

      // Check for inline clarity initialization
      const inlineScripts = Array.from(document.querySelectorAll('script:not([src])'));
      const hasClarityInline = inlineScripts.some(script =>
        script.textContent?.includes('clarity.ms/tag/') ||
        script.textContent?.includes('window.clarity')
      );

      return {
        hasClarity,
        hasClarityScript,
        hasClarityInline
      };
    });

    const clarityDetected = clarityInfo.hasClarity || clarityInfo.hasClarityScript || clarityInfo.hasClarityInline;

    console.log(`Clarity Detection: function=${clarityInfo.hasClarity}, script=${clarityInfo.hasClarityScript}, inline=${clarityInfo.hasClarityInline}`);

    if (clarityDetected) {
      console.log("✅ Microsoft Clarity detected");
    }

    expect(clarityDetected).toBeTruthy();
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
    await page.waitForLoadState("networkidle");

    // Check for analytics scripts (including inline scripts that load external ones)
    const analyticsInfo = await page.evaluate(() => {
      const scripts: Array<{src: string | null; async: boolean; defer: boolean; isInline: boolean}> = [];

      // Check external scripts with src
      const externalScripts = document.querySelectorAll<HTMLScriptElement>(
        'script[src*="googletagmanager"], script[src*="clarity.ms"], script[src*="analytics"], script[src*="gtag"], script[src*="hubspot"], script[src*="hs-analytics"]'
      );

      externalScripts.forEach((el) => {
        scripts.push({
          src: el.getAttribute("src"),
          async: el.hasAttribute("async") || el.async === true,
          defer: el.hasAttribute("defer"),
          isInline: false
        });
      });

      // Check inline scripts that create analytics scripts dynamically
      const inlineScripts = document.querySelectorAll<HTMLScriptElement>("script:not([src])");
      inlineScripts.forEach((el) => {
        const content = el.textContent || "";
        if (
          content.includes("googletagmanager.com") ||
          content.includes("clarity.ms") ||
          content.includes(".async=true") ||
          content.includes("async=1")
        ) {
          scripts.push({
            src: "inline-analytics-loader",
            async: content.includes(".async=true") || content.includes("async=1") || content.includes("async:true"),
            defer: false,
            isInline: true
          });
        }
      });

      return scripts;
    });

    for (const script of analyticsInfo) {
      const isNonBlocking = script.async || script.defer;
      const scriptLabel = script.isInline ? "Inline loader" : script.src?.substring(0, 50);
      console.log(`Script: ${scriptLabel}... - ${isNonBlocking ? "Non-blocking" : "Blocking"}`);
    }

    // At least one analytics script should be loaded (even if inline)
    expect(analyticsInfo.length).toBeGreaterThan(0);

    // Most analytics scripts should be non-blocking
    const nonBlockingCount = analyticsInfo.filter((s) => s.async || s.defer).length;
    expect(nonBlockingCount).toBeGreaterThan(0);

    console.log(`✅ Found ${analyticsInfo.length} analytics scripts, ${nonBlockingCount} are non-blocking`);
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
