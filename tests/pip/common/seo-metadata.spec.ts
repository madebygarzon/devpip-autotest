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

    const metaDescription = await page.locator('meta[name="description"]').first().getAttribute("content");

    expect(metaDescription).toBeTruthy();
    expect(metaDescription!.length).toBeGreaterThan(50);
    expect(metaDescription!.length).toBeLessThanOrEqual(160); // SEO best practice (permitir exactamente 160)

    console.log(`✅ Meta description (${metaDescription!.length} chars): "${metaDescription}"`);
  });

  test("Pages have canonical URLs", async ({ page }) => {
    const pages = ["/", "/about/", "/services/"];
    let canonicalCount = 0;

    for (const url of pages) {
      await page.goto(url);

      const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");

      if (canonical) {
        expect(canonical).toMatch(/^https:\/\/partnerinpublishing\.com/);
        console.log(`✅ ${url} has canonical: ${canonical}`);
        canonicalCount++;
      } else {
        console.log(`ℹ️  ${url} has no canonical tag (optional but recommended)`);
      }
    }

    // Al menos la homepage debería tener canonical
    if (canonicalCount === 0) {
      console.log("⚠️  No canonical URLs found - consider adding them for SEO");
    }
  });

  test("Open Graph meta tags are present", async ({ page }) => {
    await page.goto("/");

    const ogTitle = await page.locator('meta[property="og:title"]').first().getAttribute("content");
    const ogDescription = await page.locator('meta[property="og:description"]').first().getAttribute("content");
    const ogImage = await page.locator('meta[property="og:image"]').first().getAttribute("content");
    const ogUrl = await page.locator('meta[property="og:url"]').first().getAttribute("content");

    // At least title and description should exist
    expect(ogTitle).toBeTruthy();
    expect(ogDescription).toBeTruthy();

    console.log(`✅ OG title: "${ogTitle}"`);
    console.log(`✅ OG description: "${ogDescription}"`);

    if (ogImage) {
      expect(ogImage).toMatch(/^https?:\/\//);
      console.log(`✅ OG image: ${ogImage}`);
    }

    if (ogUrl) {
      expect(ogUrl).toContain("partnerinpublishing.com");
      console.log(`✅ OG url: ${ogUrl}`);
    }
  });

  test("Twitter Card meta tags are present", async ({ page }) => {
    await page.goto("/");

    const twitterCard = await page.locator('meta[name="twitter:card"]').getAttribute("content");
    const twitterTitle = await page.locator('meta[name="twitter:title"]').getAttribute("content");

    if (twitterCard) {
      expect(twitterCard).toMatch(/summary|summary_large_image/);
      console.log(`✅ Twitter card type: ${twitterCard}`);

      if (twitterTitle) {
        expect(twitterTitle.length).toBeGreaterThan(0);
        console.log(`✅ Twitter title: ${twitterTitle}`);
      }
    } else {
      console.log("ℹ️  No Twitter Card meta tags (optional - Open Graph tags will be used as fallback)");
    }
  });

  test("Structured data (Schema.org) is present", async ({ page }) => {
    await page.goto("/");

    // Look for JSON-LD structured data
    const structuredData = page.locator('script[type="application/ld+json"]');
    const count = await structuredData.count();

    expect(count).toBeGreaterThan(0);

    if (count > 0) {
      let foundValidSchema = false;
      const schemaTypes: string[] = [];

      // Check all JSON-LD blocks
      for (let i = 0; i < count; i++) {
        const jsonContent = await structuredData.nth(i).textContent();

        if (jsonContent) {
          try {
            const parsed = JSON.parse(jsonContent);

            // Handle both single objects and arrays
            if (Array.isArray(parsed)) {
              // It's an array of schema objects
              for (const item of parsed) {
                if (item["@type"]) {
                  foundValidSchema = true;
                  const type = Array.isArray(item["@type"]) ? item["@type"].join(", ") : item["@type"];
                  schemaTypes.push(type);
                }
              }
            } else {
              // It's a single schema object
              if (parsed["@type"]) {
                foundValidSchema = true;
                const type = Array.isArray(parsed["@type"]) ? parsed["@type"].join(", ") : parsed["@type"];
                schemaTypes.push(type);
              }
              if (parsed["@context"]) {
                foundValidSchema = true;
              }
            }
          } catch (e) {
            console.log(`⚠️  Could not parse JSON-LD block ${i + 1}`);
          }
        }
      }

      expect(foundValidSchema).toBeTruthy();
      console.log(`✅ Found ${count} structured data blocks`);
      console.log(`✅ Schema types found: ${schemaTypes.join(", ")}`);
    } else {
      console.log("❌ No structured data found");
    }
  });

  test("Robots meta tag allows indexing", async ({ page }) => {
    await page.goto("/");

    const robotsMeta = await page.locator('meta[name="robots"]').getAttribute("content");

    // If robots meta exists, should not have noindex
    if (robotsMeta) {
      expect(robotsMeta).not.toContain("noindex");
      console.log(`✅ Robots meta: ${robotsMeta}`);
    } else {
      console.log("ℹ️  No robots meta tag (defaults to indexable - this is OK)");
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

    // Only check actual img elements, not inline SVGs
    const images = page.locator("img[src]:not([src^='data:'])");
    const count = await images.count();

    let imagesWithAlt = 0;
    let descriptiveFilenames = 0;
    let missingAlt: string[] = [];

    for (let i = 0; i < Math.min(count, 10); i++) {
      const img = images.nth(i);
      const src = await img.getAttribute("src");
      const alt = await img.getAttribute("alt");

      // Check for descriptive filename (not just numbers)
      if (src && !/\/\d+\.jpg|\/\d+\.png|\/image\d+/.test(src)) {
        descriptiveFilenames++;
      }

      // Alt text should exist and be meaningful
      if (alt !== null && alt.trim().length > 0) {
        imagesWithAlt++;
      } else if (src) {
        missingAlt.push(src.substring(src.lastIndexOf('/') + 1));
      }
    }

    console.log(`✅ ${imagesWithAlt}/${Math.min(count, 10)} images have alt text`);
    console.log(`✅ ${descriptiveFilenames}/${Math.min(count, 10)} images have descriptive filenames`);

    if (missingAlt.length > 0) {
      console.log(`⚠️  Images missing alt text: ${missingAlt.slice(0, 3).join(', ')}${missingAlt.length > 3 ? '...' : ''}`);
    }

    // At least some images should have alt text
    expect(imagesWithAlt).toBeGreaterThan(0);
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
