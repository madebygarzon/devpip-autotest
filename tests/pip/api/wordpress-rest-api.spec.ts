import { test, expect } from "@playwright/test";

/**
 * WordPress REST API Tests
 * Tests the WordPress backend API endpoints
 */

const BASE_URL = "https://partnerinpublishing.com";
const WP_JSON = `${BASE_URL}/wp-json/wp/v2`;

test.describe("WordPress REST API - Core Endpoints", () => {
  test("WordPress REST API should be accessible", async ({ request }) => {
    const response = await request.get(`${BASE_URL}/wp-json`);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty("name");
    expect(data).toHaveProperty("url");
    expect(data).toHaveProperty("namespaces");
  });

  test("Should return site information", async ({ request }) => {
    const response = await request.get(`${BASE_URL}/wp-json`);
    const data = await response.json();

    expect(data.name).toBeTruthy();
    expect(data.url).toBe(BASE_URL);
    expect(data.namespaces).toContain("wp/v2");
  });

  test("Posts endpoint should be available", async ({ request }) => {
    const response = await request.get(`${WP_JSON}/posts`);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const posts = await response.json();
    expect(Array.isArray(posts)).toBeTruthy();
  });

  test("Pages endpoint should be available", async ({ request }) => {
    const response = await request.get(`${WP_JSON}/pages`);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const pages = await response.json();
    expect(Array.isArray(pages)).toBeTruthy();
  });

  test("Media endpoint should be available", async ({ request }) => {
    const response = await request.get(`${WP_JSON}/media`);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const media = await response.json();
    expect(Array.isArray(media)).toBeTruthy();
  });

  test("Categories endpoint should be available", async ({ request }) => {
    const response = await request.get(`${WP_JSON}/categories`);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const categories = await response.json();
    expect(Array.isArray(categories)).toBeTruthy();
  });

  test("Tags endpoint should be available", async ({ request }) => {
    const response = await request.get(`${WP_JSON}/tags`);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const tags = await response.json();
    expect(Array.isArray(tags)).toBeTruthy();
  });

  test("Users endpoint should be available", async ({ request }) => {
    const response = await request.get(`${WP_JSON}/users`);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const users = await response.json();
    expect(Array.isArray(users)).toBeTruthy();
  });
});

test.describe("WordPress REST API - Data Validation", () => {
  test("Posts should have required fields", async ({ request }) => {
    const response = await request.get(`${WP_JSON}/posts?per_page=1`);
    const posts = await response.json();

    if (posts.length > 0) {
      const post = posts[0];

      expect(post).toHaveProperty("id");
      expect(post).toHaveProperty("title");
      expect(post).toHaveProperty("content");
      expect(post).toHaveProperty("excerpt");
      expect(post).toHaveProperty("author");
      expect(post).toHaveProperty("date");
      expect(post).toHaveProperty("slug");
      expect(post).toHaveProperty("link");
    }
  });

  test("Pages should have required fields", async ({ request }) => {
    const response = await request.get(`${WP_JSON}/pages?per_page=1`);
    const pages = await response.json();

    if (pages.length > 0) {
      const page = pages[0];

      expect(page).toHaveProperty("id");
      expect(page).toHaveProperty("title");
      expect(page).toHaveProperty("content");
      expect(page).toHaveProperty("slug");
      expect(page).toHaveProperty("link");
      expect(page).toHaveProperty("parent");
    }
  });

  test("Media items should have required fields", async ({ request }) => {
    const response = await request.get(`${WP_JSON}/media?per_page=1`);
    const media = await response.json();

    if (media.length > 0) {
      const item = media[0];

      expect(item).toHaveProperty("id");
      expect(item).toHaveProperty("title");
      expect(item).toHaveProperty("source_url");
      expect(item).toHaveProperty("media_type");
      expect(item).toHaveProperty("mime_type");
    }
  });
});

test.describe("WordPress REST API - Performance", () => {
  test("Posts endpoint should respond quickly", async ({ request }) => {
    const startTime = Date.now();
    const response = await request.get(`${WP_JSON}/posts?per_page=10`);
    const duration = Date.now() - startTime;

    expect(response.ok()).toBeTruthy();
    expect(duration).toBeLessThan(3000); // Should respond in < 3 seconds
  });

  test("Pages endpoint should respond quickly", async ({ request }) => {
    const startTime = Date.now();
    const response = await request.get(`${WP_JSON}/pages?per_page=10`);
    const duration = Date.now() - startTime;

    expect(response.ok()).toBeTruthy();
    expect(duration).toBeLessThan(3000);
  });

  test("API should handle concurrent requests", async ({ request }) => {
    const endpoints = [
      `${WP_JSON}/posts?per_page=5`,
      `${WP_JSON}/pages?per_page=5`,
      `${WP_JSON}/media?per_page=5`,
      `${WP_JSON}/categories`,
      `${WP_JSON}/tags`
    ];

    const startTime = Date.now();
    const requests = endpoints.map(url => request.get(url));
    const responses = await Promise.all(requests);
    const duration = Date.now() - startTime;

    responses.forEach(response => {
      expect(response.ok()).toBeTruthy();
    });

    // All 5 requests should complete in under 5 seconds
    expect(duration).toBeLessThan(5000);
  });
});

test.describe("WordPress REST API - Pagination", () => {
  test("Should support pagination parameters", async ({ request }) => {
    const response = await request.get(`${WP_JSON}/posts?per_page=5&page=1`);

    expect(response.ok()).toBeTruthy();

    const posts = await response.json();
    expect(posts.length).toBeLessThanOrEqual(5);

    // Check pagination headers
    const headers = response.headers();
    expect(headers).toHaveProperty("x-wp-total");
    expect(headers).toHaveProperty("x-wp-totalpages");
  });

  test("Should return correct pagination headers", async ({ request }) => {
    const response = await request.get(`${WP_JSON}/posts?per_page=10`);
    const headers = response.headers();

    const total = parseInt(headers["x-wp-total"] || "0");
    const totalPages = parseInt(headers["x-wp-totalpages"] || "0");

    expect(total).toBeGreaterThanOrEqual(0);
    expect(totalPages).toBeGreaterThanOrEqual(0);

    if (total > 10) {
      expect(totalPages).toBeGreaterThan(1);
    }
  });
});

test.describe("WordPress REST API - Query Parameters", () => {
  test("Should filter posts by search query", async ({ request }) => {
    const response = await request.get(`${WP_JSON}/posts?search=publishing`);

    expect(response.ok()).toBeTruthy();
    const posts = await response.json();
    expect(Array.isArray(posts)).toBeTruthy();
  });

  test("Should order posts by date", async ({ request }) => {
    const response = await request.get(`${WP_JSON}/posts?orderby=date&order=desc&per_page=5`);

    expect(response.ok()).toBeTruthy();
    const posts = await response.json();

    if (posts.length > 1) {
      const firstPostDate = new Date(posts[0].date);
      const secondPostDate = new Date(posts[1].date);
      expect(firstPostDate.getTime()).toBeGreaterThanOrEqual(secondPostDate.getTime());
    }
  });

  test("Should filter by categories", async ({ request }) => {
    // First get a category ID
    const categoriesResponse = await request.get(`${WP_JSON}/categories?per_page=1`);
    const categories = await categoriesResponse.json();

    if (categories.length > 0) {
      const categoryId = categories[0].id;
      const postsResponse = await request.get(`${WP_JSON}/posts?categories=${categoryId}`);

      expect(postsResponse.ok()).toBeTruthy();
      const posts = await postsResponse.json();
      expect(Array.isArray(posts)).toBeTruthy();
    }
  });
});

test.describe("WordPress REST API - Error Handling", () => {
  test("Should return 404 for non-existent post", async ({ request }) => {
    const response = await request.get(`${WP_JSON}/posts/999999999`);

    expect(response.status()).toBe(404);

    const error = await response.json();
    expect(error).toHaveProperty("code");
    expect(error.code).toBe("rest_post_invalid_id");
  });

  test("Should return 404 for non-existent page", async ({ request }) => {
    const response = await request.get(`${WP_JSON}/pages/999999999`);

    expect(response.status()).toBe(404);
  });

  test("Should reject invalid query parameters gracefully", async ({ request }) => {
    const response = await request.get(`${WP_JSON}/posts?per_page=invalid`);

    // Should either return 400 or default to safe value
    expect([200, 400]).toContain(response.status());
  });

  test("Should handle missing authentication for protected endpoints", async ({ request }) => {
    // Try to create a post without authentication
    const response = await request.post(`${WP_JSON}/posts`, {
      data: {
        title: "Test Post",
        content: "Test Content"
      }
    });

    expect(response.status()).toBe(401); // Unauthorized
  });
});
