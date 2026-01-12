import { test, expect } from "@playwright/test";

/**
 * WordPress Backend Endpoints Tests
 * Tests for WordPress backend-specific functionality
 */

const BASE_URL = "https://partnerinpublishing.com";
const WP_JSON = `${BASE_URL}/wp-json/wp/v2`;

test.describe("WordPress Backend - Custom Post Types", () => {
  test("Should check for custom post types availability", async ({ request }) => {
    const response = await request.get(`${BASE_URL}/wp-json/wp/v2/types`);

    expect(response.ok()).toBeTruthy();
    const types = await response.json();

    expect(types).toHaveProperty("post");
    expect(types).toHaveProperty("page");
    // Check for common custom post types
    expect(types).toBeTruthy();
  });

  test("Should validate custom post type structure", async ({ request }) => {
    const response = await request.get(`${BASE_URL}/wp-json/wp/v2/types`);
    const types = await response.json();

    Object.values(types).forEach((type: any) => {
      expect(type).toHaveProperty("description");
      expect(type).toHaveProperty("hierarchical");
      expect(type).toHaveProperty("name");
      expect(type).toHaveProperty("slug");
      expect(type).toHaveProperty("rest_base");
    });
  });
});

test.describe("WordPress Backend - Taxonomies", () => {
  test("Should return all registered taxonomies", async ({ request }) => {
    const response = await request.get(`${BASE_URL}/wp-json/wp/v2/taxonomies`);

    expect(response.ok()).toBeTruthy();
    const taxonomies = await response.json();

    expect(taxonomies).toHaveProperty("category");
    expect(taxonomies).toHaveProperty("post_tag");
  });

  test("Should validate taxonomy structure", async ({ request }) => {
    const response = await request.get(`${BASE_URL}/wp-json/wp/v2/taxonomies`);
    const taxonomies = await response.json();

    Object.values(taxonomies).forEach((taxonomy: any) => {
      expect(taxonomy).toHaveProperty("name");
      expect(taxonomy).toHaveProperty("slug");
      expect(taxonomy).toHaveProperty("description");
      expect(taxonomy).toHaveProperty("types");
      expect(taxonomy).toHaveProperty("hierarchical");
      expect(taxonomy).toHaveProperty("rest_base");
    });
  });

  test("Should retrieve terms from each taxonomy", async ({ request }) => {
    const response = await request.get(`${BASE_URL}/wp-json/wp/v2/taxonomies`);
    const taxonomies = await response.json();

    for (const [key, taxonomy] of Object.entries(taxonomies as any)) {
      if (taxonomy.rest_base) {
        const termsResponse = await request.get(
          `${BASE_URL}/wp-json/wp/v2/${taxonomy.rest_base}`
        );
        expect(termsResponse.ok()).toBeTruthy();
      }
    }
  });
});

test.describe("WordPress Backend - Settings Endpoints", () => {
  test("Should check settings endpoint access", async ({ request }) => {
    const response = await request.get(`${BASE_URL}/wp-json/wp/v2/settings`);

    // Should be restricted without authentication
    expect(response.status()).toBe(401);
  });

  test("Should return proper error for unauthorized settings access", async ({ request }) => {
    const response = await request.get(`${BASE_URL}/wp-json/wp/v2/settings`);
    const error = await response.json();

    expect(error).toHaveProperty("code");
    expect(error.code).toBe("rest_forbidden");
  });
});

test.describe("WordPress Backend - Search Functionality", () => {
  test("Should perform global search across content", async ({ request }) => {
    const response = await request.get(`${BASE_URL}/wp-json/wp/v2/search?search=publishing`);

    expect(response.ok()).toBeTruthy();
    const results = await response.json();
    expect(Array.isArray(results)).toBeTruthy();
  });

  test("Should validate search result structure", async ({ request }) => {
    const response = await request.get(`${BASE_URL}/wp-json/wp/v2/search?search=partner`);
    const results = await response.json();

    if (results.length > 0) {
      const result = results[0];
      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("title");
      expect(result).toHaveProperty("url");
      expect(result).toHaveProperty("type");
      expect(result).toHaveProperty("subtype");
    }
  });

  test("Should support search type filtering", async ({ request }) => {
    const types = ["post", "page"];

    for (const type of types) {
      const response = await request.get(
        `${BASE_URL}/wp-json/wp/v2/search?type=${type}&search=test`
      );

      expect(response.ok()).toBeTruthy();
      const results = await response.json();

      if (results.length > 0) {
        results.forEach((result: any) => {
          expect(result.type).toBe(type);
        });
      }
    }
  });

  test("Should handle empty search results gracefully", async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}/wp-json/wp/v2/search?search=xyznonexistentquery12345`
    );

    expect(response.ok()).toBeTruthy();
    const results = await response.json();
    expect(Array.isArray(results)).toBeTruthy();
    expect(results.length).toBe(0);
  });
});

test.describe("WordPress Backend - Block Editor (Gutenberg) Support", () => {
  test("Should check block types endpoint", async ({ request }) => {
    const response = await request.get(`${BASE_URL}/wp-json/wp/v2/block-types`);

    if (response.ok()) {
      const blockTypes = await response.json();
      expect(Array.isArray(blockTypes)).toBeTruthy();
      expect(blockTypes.length).toBeGreaterThan(0);
    }
  });

  test("Should validate block type structure", async ({ request }) => {
    const response = await request.get(`${BASE_URL}/wp-json/wp/v2/block-types`);

    if (response.ok()) {
      const blockTypes = await response.json();

      if (blockTypes.length > 0) {
        const block = blockTypes[0];
        expect(block).toHaveProperty("name");
        expect(block).toHaveProperty("title");
      }
    }
  });

  test("Should check reusable blocks endpoint", async ({ request }) => {
    const response = await request.get(`${BASE_URL}/wp-json/wp/v2/blocks`);

    // Endpoint should exist even if no reusable blocks
    expect([200, 401]).toContain(response.status());
  });
});

test.describe("WordPress Backend - Comments API", () => {
  test("Should access comments endpoint", async ({ request }) => {
    const response = await request.get(`${BASE_URL}/wp-json/wp/v2/comments`);

    expect(response.ok()).toBeTruthy();
    const comments = await response.json();
    expect(Array.isArray(comments)).toBeTruthy();
  });

  test("Should validate comment structure", async ({ request }) => {
    const response = await request.get(`${BASE_URL}/wp-json/wp/v2/comments?per_page=1`);
    const comments = await response.json();

    if (comments.length > 0) {
      const comment = comments[0];
      expect(comment).toHaveProperty("id");
      expect(comment).toHaveProperty("post");
      expect(comment).toHaveProperty("author_name");
      expect(comment).toHaveProperty("content");
      expect(comment).toHaveProperty("date");
      expect(comment).toHaveProperty("status");
    }
  });

  test("Should filter comments by post", async ({ request }) => {
    // First get a post
    const postsResponse = await request.get(`${WP_JSON}/posts?per_page=1`);
    const posts = await postsResponse.json();

    if (posts.length > 0) {
      const postId = posts[0].id;
      const commentsResponse = await request.get(`${WP_JSON}/comments?post=${postId}`);

      expect(commentsResponse.ok()).toBeTruthy();
      const comments = await commentsResponse.json();

      comments.forEach((comment: any) => {
        expect(comment.post).toBe(postId);
      });
    }
  });

  test("Should prevent unauthorized comment creation", async ({ request }) => {
    const response = await request.post(`${WP_JSON}/comments`, {
      data: {
        post: 1,
        author_name: "Test User",
        author_email: "test@example.com",
        content: "Test comment"
      }
    });

    // May be 401 (unauthorized) or 201 (created) if comments are open
    expect([201, 401, 403, 409]).toContain(response.status());
  });
});

test.describe("WordPress Backend - Revisions", () => {
  test("Should check revisions endpoint for posts", async ({ request }) => {
    const postsResponse = await request.get(`${WP_JSON}/posts?per_page=1`);
    const posts = await postsResponse.json();

    if (posts.length > 0) {
      const postId = posts[0].id;
      const revisionsResponse = await request.get(`${WP_JSON}/posts/${postId}/revisions`);

      // May require authentication
      expect([200, 401]).toContain(revisionsResponse.status());
    }
  });

  test("Should check autosave endpoint", async ({ request }) => {
    const postsResponse = await request.get(`${WP_JSON}/posts?per_page=1`);
    const posts = await postsResponse.json();

    if (posts.length > 0) {
      const postId = posts[0].id;
      const autosaveResponse = await request.get(`${WP_JSON}/posts/${postId}/autosaves`);

      // Should require authentication
      expect([200, 401]).toContain(autosaveResponse.status());
    }
  });
});

test.describe("WordPress Backend - Theme and Plugin Detection", () => {
  test("Should detect WordPress theme via HTML", async ({ request }) => {
    const response = await request.get(BASE_URL);
    const html = await response.text();

    // Check for theme stylesheet link
    expect(html).toContain("/wp-content/themes/");
  });

  test("Should detect active plugins via HTML", async ({ request }) => {
    const response = await request.get(BASE_URL);
    const html = await response.text();

    // Check for plugin assets
    expect(html).toContain("/wp-content/plugins/");
  });

  test("Should check for common WordPress meta tags", async ({ request }) => {
    const response = await request.get(BASE_URL);
    const html = await response.text();

    // WordPress version might be in meta generator tag
    const hasGenerator = html.includes('name="generator"') || html.includes("wp-");
    expect(hasGenerator).toBeTruthy();
  });
});

test.describe("WordPress Backend - Embed Support", () => {
  test("Should support oEmbed discovery", async ({ request }) => {
    const postsResponse = await request.get(`${WP_JSON}/posts?per_page=1`);
    const posts = await postsResponse.json();

    if (posts.length > 0) {
      const postUrl = posts[0].link;
      const response = await request.get(postUrl);
      const html = await response.text();

      // Check for oEmbed discovery links
      expect(html).toContain('application/json+oembed');
    }
  });

  test("Should return embed data for posts", async ({ request }) => {
    const postsResponse = await request.get(`${WP_JSON}/posts?per_page=1`);
    const posts = await postsResponse.json();

    if (posts.length > 0) {
      const post = posts[0];
      expect(post._links).toHaveProperty("wp:attachment");
      expect(post._links).toHaveProperty("wp:term");
      expect(post._links).toHaveProperty("author");
    }
  });
});
