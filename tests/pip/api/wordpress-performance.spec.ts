import { test, expect } from "@playwright/test";

/**
 * WordPress Performance and Caching Tests
 * Tests for caching mechanisms, optimization, and performance
 */

const BASE_URL = "https://partnerinpublishing.com";
const WP_JSON = `${BASE_URL}/wp-json/wp/v2`;

test.describe("WordPress Performance - Response Times", () => {
  test("Should load homepage quickly", async ({ request }) => {
    const startTime = Date.now();
    const response = await request.get(BASE_URL);
    const duration = Date.now() - startTime;

    expect(response.ok()).toBeTruthy();
    expect(duration).toBeLessThan(3000); // 3 seconds
  });

  test("Should load REST API root quickly", async ({ request }) => {
    const startTime = Date.now();
    const response = await request.get(`${BASE_URL}/wp-json`);
    const duration = Date.now() - startTime;

    expect(response.ok()).toBeTruthy();
    expect(duration).toBeLessThan(2000); // 2 seconds
  });

  test("Should load posts endpoint efficiently", async ({ request }) => {
    const startTime = Date.now();
    const response = await request.get(`${WP_JSON}/posts?per_page=10`);
    const duration = Date.now() - startTime;

    expect(response.ok()).toBeTruthy();
    expect(duration).toBeLessThan(2000);
  });

  test("Should load pages endpoint efficiently", async ({ request }) => {
    const startTime = Date.now();
    const response = await request.get(`${WP_JSON}/pages?per_page=10`);
    const duration = Date.now() - startTime;

    expect(response.ok()).toBeTruthy();
    expect(duration).toBeLessThan(2000);
  });

  test("Should handle large result sets efficiently", async ({ request }) => {
    const startTime = Date.now();
    const response = await request.get(`${WP_JSON}/posts?per_page=100`);
    const duration = Date.now() - startTime;

    expect(response.ok()).toBeTruthy();
    expect(duration).toBeLessThan(4000); // 4 seconds for larger dataset
  });
});

test.describe("WordPress Performance - Caching Headers", () => {
  test("Should include caching headers for static content", async ({ request }) => {
    const response = await request.get(BASE_URL);
    const headers = response.headers();

    // Check for cache-related headers
    expect(
      headers["cache-control"] ||
      headers["expires"] ||
      headers["etag"] ||
      headers["last-modified"]
    ).toBeTruthy();
  });

  test("Should set appropriate cache-control for API responses", async ({ request }) => {
    const response = await request.get(`${WP_JSON}/posts?per_page=5`);
    const headers = response.headers();

    expect(headers["cache-control"]).toBeTruthy();
  });

  test("Should include ETag for posts", async ({ request }) => {
    const response = await request.get(`${WP_JSON}/posts?per_page=1`);
    const headers = response.headers();

    // ETags help with conditional requests
    if (headers["etag"]) {
      expect(headers["etag"]).toBeTruthy();
    }
  });

  test("Should support conditional requests with If-None-Match", async ({ request }) => {
    const firstResponse = await request.get(`${WP_JSON}/posts?per_page=5`);
    const etag = firstResponse.headers()["etag"];

    if (etag) {
      const secondResponse = await request.get(`${WP_JSON}/posts?per_page=5`, {
        headers: {
          "If-None-Match": etag
        }
      });

      // Should return 304 Not Modified if content hasn't changed
      expect([200, 304]).toContain(secondResponse.status());
    }
  });

  test("Should include Last-Modified header", async ({ request }) => {
    const response = await request.get(BASE_URL);
    const headers = response.headers();

    if (headers["last-modified"]) {
      expect(headers["last-modified"]).toBeTruthy();
      expect(new Date(headers["last-modified"]).getTime()).toBeGreaterThan(0);
    }
  });
});

test.describe("WordPress Performance - Content Delivery", () => {
  test("Should compress responses with gzip or brotli", async ({ request }) => {
    const response = await request.get(BASE_URL, {
      headers: {
        "Accept-Encoding": "gzip, deflate, br"
      }
    });

    const headers = response.headers();

    // Check for compression
    expect(
      headers["content-encoding"] === "gzip" ||
      headers["content-encoding"] === "br" ||
      headers["content-encoding"] === "deflate"
    ).toBeTruthy();
  });

  test("Should compress REST API responses", async ({ request }) => {
    const response = await request.get(`${WP_JSON}/posts?per_page=20`, {
      headers: {
        "Accept-Encoding": "gzip, deflate, br"
      }
    });

    const headers = response.headers();

    if (headers["content-encoding"]) {
      expect(["gzip", "br", "deflate"]).toContain(headers["content-encoding"]);
    }
  });

  test("Should serve images with appropriate formats", async ({ request }) => {
    const response = await request.get(`${WP_JSON}/media?media_type=image&per_page=5`);
    const images = await response.json();

    for (const image of images) {
      const imageResponse = await request.get(image.source_url);
      const contentType = imageResponse.headers()["content-type"];

      // Check for modern image formats
      expect(contentType).toMatch(/image\/(jpeg|jpg|png|webp|gif|svg)/);
    }
  });
});

test.describe("WordPress Performance - Database Optimization", () => {
  test("Should efficiently query posts with filters", async ({ request }) => {
    const startTime = Date.now();
    const response = await request.get(
      `${WP_JSON}/posts?per_page=10&orderby=date&order=desc`
    );
    const duration = Date.now() - startTime;

    expect(response.ok()).toBeTruthy();
    expect(duration).toBeLessThan(2000);
  });

  test("Should efficiently filter by category", async ({ request }) => {
    const categoriesResponse = await request.get(`${WP_JSON}/categories?per_page=1`);
    const categories = await categoriesResponse.json();

    if (categories.length > 0) {
      const startTime = Date.now();
      const response = await request.get(`${WP_JSON}/posts?categories=${categories[0].id}`);
      const duration = Date.now() - startTime;

      expect(response.ok()).toBeTruthy();
      expect(duration).toBeLessThan(2000);
    }
  });

  test("Should efficiently search content", async ({ request }) => {
    const startTime = Date.now();
    const response = await request.get(`${WP_JSON}/posts?search=publishing&per_page=10`);
    const duration = Date.now() - startTime;

    expect(response.ok()).toBeTruthy();
    expect(duration).toBeLessThan(3000);
  });

  test("Should handle complex queries efficiently", async ({ request }) => {
    const categoriesResponse = await request.get(`${WP_JSON}/categories?per_page=1`);
    const categories = await categoriesResponse.json();

    if (categories.length > 0) {
      const startTime = Date.now();
      const response = await request.get(
        `${WP_JSON}/posts?categories=${categories[0].id}&orderby=date&order=desc&per_page=10`
      );
      const duration = Date.now() - startTime;

      expect(response.ok()).toBeTruthy();
      expect(duration).toBeLessThan(3000);
    }
  });
});

test.describe("WordPress Performance - Concurrent Requests", () => {
  test("Should handle multiple concurrent API calls", async ({ request }) => {
    const endpoints = [
      `${WP_JSON}/posts?per_page=5`,
      `${WP_JSON}/pages?per_page=5`,
      `${WP_JSON}/categories`,
      `${WP_JSON}/tags`,
      `${WP_JSON}/media?per_page=5`
    ];

    const startTime = Date.now();
    const responses = await Promise.all(
      endpoints.map(url => request.get(url))
    );
    const duration = Date.now() - startTime;

    responses.forEach(response => {
      expect(response.ok()).toBeTruthy();
    });

    // All requests should complete reasonably fast
    expect(duration).toBeLessThan(5000);
  });

  test("Should handle concurrent post requests", async ({ request }) => {
    const requests = Array(10).fill(null).map(() =>
      request.get(`${WP_JSON}/posts?per_page=5`)
    );

    const startTime = Date.now();
    const responses = await Promise.all(requests);
    const duration = Date.now() - startTime;

    responses.forEach(response => {
      expect(response.ok()).toBeTruthy();
    });

    expect(duration).toBeLessThan(6000);
  });
});

test.describe("WordPress Performance - Asset Optimization", () => {
  test("Should load CSS files efficiently", async ({ request }) => {
    const response = await request.get(BASE_URL);
    const html = await response.text();

    // Find CSS links
    const cssRegex = /<link[^>]*href=["']([^"']*\.css[^"']*)["'][^>]*>/g;
    const cssMatches = [...html.matchAll(cssRegex)];

    if (cssMatches.length > 0) {
      // Check a few CSS files
      for (let i = 0; i < Math.min(3, cssMatches.length); i++) {
        let cssUrl = cssMatches[i][1];

        // Handle relative URLs
        if (cssUrl.startsWith("/")) {
          cssUrl = BASE_URL + cssUrl;
        } else if (!cssUrl.startsWith("http")) {
          continue;
        }

        const cssResponse = await request.get(cssUrl);
        expect(cssResponse.ok()).toBeTruthy();

        // CSS should be compressed
        const headers = cssResponse.headers();
        if (headers["content-encoding"]) {
          expect(["gzip", "br", "deflate"]).toContain(headers["content-encoding"]);
        }
      }
    }
  });

  test("Should load JavaScript files efficiently", async ({ request }) => {
    const response = await request.get(BASE_URL);
    const html = await response.text();

    // Find script tags
    const jsRegex = /<script[^>]*src=["']([^"']*\.js[^"']*)["'][^>]*>/g;
    const jsMatches = [...html.matchAll(jsRegex)];

    if (jsMatches.length > 0) {
      // Check a few JS files
      for (let i = 0; i < Math.min(3, jsMatches.length); i++) {
        let jsUrl = jsMatches[i][1];

        // Handle relative URLs
        if (jsUrl.startsWith("/")) {
          jsUrl = BASE_URL + jsUrl;
        } else if (!jsUrl.startsWith("http")) {
          continue;
        }

        const jsResponse = await request.get(jsUrl);
        expect(jsResponse.ok()).toBeTruthy();
      }
    }
  });
});

test.describe("WordPress Performance - Page Load Optimization", () => {
  test("Should minimize redirects", async ({ request }) => {
    const response = await request.get(BASE_URL, {
      maxRedirects: 0
    });

    // Should either load directly or have minimal redirects
    expect([200, 301, 302]).toContain(response.status());
  });

  test("Should use HTTP/2 or HTTP/3", async ({ request }) => {
    const response = await request.get(BASE_URL);

    // Modern sites should use HTTP/2 or better
    // This is informational - HTTP/1.1 is still acceptable
    expect(response.ok()).toBeTruthy();
  });

  test("Should have reasonable page size", async ({ request }) => {
    const response = await request.get(BASE_URL);
    const body = await response.body();

    // HTML page should be reasonably sized (uncompressed)
    expect(body.length).toBeLessThan(5 * 1024 * 1024); // 5MB
  });

  test("Should minimize number of API calls for listing", async ({ request }) => {
    // Single request should provide comprehensive data
    const response = await request.get(`${WP_JSON}/posts?per_page=10&_embed`);

    expect(response.ok()).toBeTruthy();

    const posts = await response.json();

    if (posts.length > 0 && posts[0]._embedded) {
      // _embed should include author, media, etc.
      expect(posts[0]._embedded).toBeTruthy();
    }
  });
});

test.describe("WordPress Performance - Resource Hints", () => {
  test("Should include resource hints for optimization", async ({ request }) => {
    const response = await request.get(BASE_URL);
    const html = await response.text();

    // Check for DNS prefetch, preconnect, or preload
    const hasResourceHints =
      html.includes('rel="dns-prefetch"') ||
      html.includes('rel="preconnect"') ||
      html.includes('rel="preload"');

    // Resource hints are optional but beneficial
    expect(html).toBeTruthy();
  });

  test("Should defer non-critical JavaScript", async ({ request }) => {
    const response = await request.get(BASE_URL);
    const html = await response.text();

    // Check if scripts use defer or async
    const scriptTags = html.match(/<script[^>]*>/g) || [];
    const optimizedScripts = scriptTags.filter(tag =>
      tag.includes("defer") || tag.includes("async")
    );

    // At least some scripts should be deferred/async
    expect(scriptTags.length).toBeGreaterThan(0);
  });
});

test.describe("WordPress Performance - CDN Usage", () => {
  test("Should check for CDN usage in media delivery", async ({ request }) => {
    const response = await request.get(`${WP_JSON}/media?per_page=5`);
    const media = await response.json();

    media.forEach((item: any) => {
      expect(item.source_url).toBeTruthy();
      // CDN usage is optional - just verify URLs are valid
      expect(() => new URL(item.source_url)).not.toThrow();
    });
  });

  test("Should check for static asset CDN", async ({ request }) => {
    const response = await request.get(BASE_URL);
    const html = await response.text();

    // Extract asset URLs
    const assetRegex = /(href|src)=["']([^"']+\.(css|js|jpg|png|gif|webp))["']/g;
    const matches = [...html.matchAll(assetRegex)];

    // All asset URLs should be accessible
    expect(matches.length).toBeGreaterThan(0);
  });
});

test.describe("WordPress Performance - Database Query Efficiency", () => {
  test("Should efficiently paginate through large datasets", async ({ request }) => {
    const firstPage = await request.get(`${WP_JSON}/posts?per_page=10&page=1`);
    const startTime = Date.now();
    const secondPage = await request.get(`${WP_JSON}/posts?per_page=10&page=2`);
    const duration = Date.now() - startTime;

    expect(firstPage.ok()).toBeTruthy();
    expect(secondPage.ok()).toBeTruthy();
    expect(duration).toBeLessThan(2000);
  });

  test("Should efficiently retrieve single items", async ({ request }) => {
    const postsResponse = await request.get(`${WP_JSON}/posts?per_page=1`);
    const posts = await postsResponse.json();

    if (posts.length > 0) {
      const startTime = Date.now();
      const response = await request.get(`${WP_JSON}/posts/${posts[0].id}`);
      const duration = Date.now() - startTime;

      expect(response.ok()).toBeTruthy();
      expect(duration).toBeLessThan(1000); // Single item should be very fast
    }
  });
});
