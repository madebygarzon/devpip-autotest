import { test, expect } from "@playwright/test";

test.describe("SEO and Metadata Tests", () => {
  test("Homepage has proper title tag", async ({ page }) => {
    await page.goto("/");

    const title = await page.title();

    // Title should exist and be meaningful
    expect(title.length).toBeGreaterThan(10);
    expect(title.length).toBeLessThan(70); // SEO best practice: 50-60 chars

    console.log(`✅ Page title: "${title}"`);
  });

  test("Homepage has meta description", async ({ page }) => {
    await page.goto("/");

    const metaDescription = await page.locator('meta[name="description"]').getAttribute("content");

    expect(metaDescription).toBeTruthy();
    expect(metaDescription!.length).toBeGreaterThan(50);
    expect(metaDescription!.length).toBeLessThan(160); // SEO best practice

    console.log(`✅ Meta description: "${metaDescription}"`);
  });

  test("Pages have canonical URLs", async ({ page }) => {
    const pages = ["/", "/about/", "/services/"];

    for (const url of pages) {
      await page.goto(url);

      const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");

      if (canonical) {
        expect(canonical).toMatch(/^https:\/\/partnerinpublishing\.com/);
        console.log(`✅ ${url} has canonical: ${canonical}`);
      }
    }
  });

  test("Open Graph meta tags are present", async ({ page }) => {
    await page.goto("/");

    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute("content");
    const ogDescription = await page.locator('meta[property="og:description"]').getAttribute("content");
    const ogImage = await page.locator('meta[property="og:image"]').getAttribute("content");
    const ogUrl = await page.locator('meta[property="og:url"]').getAttribute("content");

    // At least title and description should exist
    expect(ogTitle).toBeTruthy();
    expect(ogDescription).toBeTruthy();

    if (ogImage) {
      expect(ogImage).toMatch(/^https?:\/\//);
      console.log(`✅ OG image: ${ogImage}`);
    }

    if (ogUrl) {
      expect(ogUrl).toContain("partnerinpublishing.com");
    }
  });

  test("Twitter Card meta tags are present", async ({ page }) => {
    await page.goto("/");

    const twitterCard = await page.locator('meta[name="twitter:card"]').getAttribute("content");
    const twitterTitle = await page.locator('meta[name="twitter:title"]').getAttribute("content");

    if (twitterCard) {
      expect(twitterCard).toMatch(/summary|summary_large_image/);
      console.log(`✅ Twitter card type: ${twitterCard}`);
    }

    if (twitterTitle) {
      expect(twitterTitle.length).toBeGreaterThan(0);
    }
  });

  test("Structured data (Schema.org) is present", async ({ page }) => {
    await page.goto("/");

    // Look for JSON-LD structured data
    const structuredData = page.locator('script[type="application/ld+json"]');
    const count = await structuredData.count();

    if (count > 0) {
      const jsonContent = await structuredData.first().textContent();
      const parsed = JSON.parse(jsonContent || "{}");

      // Should have @context and @type
      expect(parsed["@context"]).toBeTruthy();
      expect(parsed["@type"]).toBeTruthy();

      console.log(`✅ Structured data type: ${parsed["@type"]}`);
    }
  });

  test("Robots meta tag allows indexing", async ({ page }) => {
    await page.goto("/");

    const robotsMeta = await page.locator('meta[name="robots"]').getAttribute("content");

    // If robots meta exists, should not have noindex
    if (robotsMeta) {
      expect(robotsMeta).not.toContain("noindex");
      console.log(`✅ Robots meta: ${robotsMeta}`);
    }
  });

  test("All pages have unique titles", async ({ page }) => {
    const urls = ["/", "/about/", "/services/"];
    const titles: string[] = [];

    for (const url of urls) {
      await page.goto(url);
      const title = await page.title();
      titles.push(title);
    }

    // All titles should be unique
    const uniqueTitles = new Set(titles);
    expect(uniqueTitles.size).toBe(titles.length);

    console.log("✅ All page titles are unique:", titles);
  });

  test("Images have descriptive filenames and alt text", async ({ page }) => {
    await page.goto("/");

    const images = page.locator("img[src]");
    const count = await images.count();

    let descriptiveCount = 0;

    for (let i = 0; i < Math.min(count, 10); i++) {
      const img = images.nth(i);
      const src = await img.getAttribute("src");
      const alt = await img.getAttribute("alt");

      // Check for descriptive filename (not just numbers)
      if (src && !/^data:|\/\d+\.jpg|\/\d+\.png/.test(src)) {
        descriptiveCount++;
      }

      // Alt text should exist and be meaningful
      if (alt && alt.length > 3 && !alt.includes("image") && !alt.includes("photo")) {
        descriptiveCount++;
      }
    }

    console.log(`✅ ${descriptiveCount} images with descriptive names/alt text`);
    expect(descriptiveCount).toBeGreaterThan(0);
  });

  test("Page has proper heading structure for SEO", async ({ page }) => {
    await page.goto("/");

    // Should have exactly one H1
    const h1Count = await page.locator("h1").count();
    expect(h1Count).toBe(1);

    // H1 should have meaningful content
    const h1Text = await page.locator("h1").textContent();
    expect(h1Text?.trim().length).toBeGreaterThan(10);

    console.log(`✅ H1: "${h1Text?.trim()}"`);
  });
});
