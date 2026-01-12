import { test, expect } from "@playwright/test";

/**
 * WordPress Content Integrity Tests
 * Tests for content structure, data consistency, and database integrity
 */

const BASE_URL = "https://partnerinpublishing.com";
const WP_JSON = `${BASE_URL}/wp-json/wp/v2`;

test.describe("WordPress Content - Posts Integrity", () => {
  test("Should validate post data consistency", async ({ request }) => {
    const response = await request.get(`${WP_JSON}/posts?per_page=10`);
    const posts = await response.json();

    expect(Array.isArray(posts)).toBeTruthy();

    posts.forEach((post: any) => {
      // Check required fields exist
      expect(post.id).toBeGreaterThan(0);
      expect(post.title).toBeTruthy();
      expect(post.title.rendered).toBeTruthy();
      expect(post.slug).toBeTruthy();
      expect(post.link).toContain(BASE_URL);

      // Validate dates
      expect(new Date(post.date).getTime()).toBeGreaterThan(0);
      expect(new Date(post.modified).getTime()).toBeGreaterThan(0);

      // Modified date should be >= creation date
      expect(new Date(post.modified).getTime()).toBeGreaterThanOrEqual(
        new Date(post.date).getTime()
      );

      // Check status is valid
      expect(["publish", "draft", "pending", "private", "future"]).toContain(post.status);
    });
  });

  test("Should verify post author relationships", async ({ request }) => {
    const response = await request.get(`${WP_JSON}/posts?per_page=5`);
    const posts = await response.json();

    for (const post of posts) {
      expect(post.author).toBeGreaterThan(0);

      // Verify author exists
      const authorResponse = await request.get(`${WP_JSON}/users/${post.author}`);
      expect(authorResponse.ok()).toBeTruthy();

      const author = await authorResponse.json();
      expect(author.id).toBe(post.author);
    }
  });

  test("Should validate post category relationships", async ({ request }) => {
    const response = await request.get(`${WP_JSON}/posts?per_page=5`);
    const posts = await response.json();

    for (const post of posts) {
      if (post.categories && post.categories.length > 0) {
        for (const categoryId of post.categories) {
          const categoryResponse = await request.get(`${WP_JSON}/categories/${categoryId}`);
          expect(categoryResponse.ok()).toBeTruthy();

          const category = await categoryResponse.json();
          expect(category.id).toBe(categoryId);
        }
      }
    }
  });

  test("Should validate post tag relationships", async ({ request }) => {
    const response = await request.get(`${WP_JSON}/posts?per_page=5`);
    const posts = await response.json();

    for (const post of posts) {
      if (post.tags && post.tags.length > 0) {
        for (const tagId of post.tags) {
          const tagResponse = await request.get(`${WP_JSON}/tags/${tagId}`);
          expect(tagResponse.ok()).toBeTruthy();

          const tag = await tagResponse.json();
          expect(tag.id).toBe(tagId);
        }
      }
    }
  });

  test("Should verify featured image relationships", async ({ request }) => {
    const response = await request.get(`${WP_JSON}/posts?per_page=10`);
    const posts = await response.json();

    for (const post of posts) {
      if (post.featured_media && post.featured_media > 0) {
        const mediaResponse = await request.get(`${WP_JSON}/media/${post.featured_media}`);
        expect(mediaResponse.ok()).toBeTruthy();

        const media = await mediaResponse.json();
        expect(media.id).toBe(post.featured_media);
        expect(media.source_url).toBeTruthy();
      }
    }
  });
});

test.describe("WordPress Content - Pages Integrity", () => {
  test("Should validate page hierarchy", async ({ request }) => {
    const response = await request.get(`${WP_JSON}/pages?per_page=20`);
    const pages = await response.json();

    for (const page of pages) {
      expect(page.id).toBeGreaterThan(0);
      expect(page.parent).toBeGreaterThanOrEqual(0);

      // If page has parent, verify parent exists
      if (page.parent > 0) {
        const parentResponse = await request.get(`${WP_JSON}/pages/${page.parent}`);
        expect(parentResponse.ok()).toBeTruthy();

        const parent = await parentResponse.json();
        expect(parent.id).toBe(page.parent);
      }
    }
  });

  test("Should validate page template assignments", async ({ request }) => {
    const response = await request.get(`${WP_JSON}/pages?per_page=10`);
    const pages = await response.json();

    pages.forEach((page: any) => {
      expect(page).toHaveProperty("template");
      // Template should be a string (could be empty for default)
      expect(typeof page.template).toBe("string");
    });
  });

  test("Should verify page order consistency", async ({ request }) => {
    const response = await request.get(`${WP_JSON}/pages?per_page=20&orderby=menu_order&order=asc`);
    const pages = await response.json();

    if (pages.length > 1) {
      for (let i = 1; i < pages.length; i++) {
        expect(pages[i].menu_order).toBeGreaterThanOrEqual(pages[i - 1].menu_order);
      }
    }
  });
});

test.describe("WordPress Content - Media Library Integrity", () => {
  test("Should validate media file accessibility", async ({ request }) => {
    const response = await request.get(`${WP_JSON}/media?per_page=10`);
    const mediaItems = await response.json();

    for (const item of mediaItems) {
      expect(item.source_url).toBeTruthy();

      // Verify the actual media file is accessible
      const mediaResponse = await request.get(item.source_url);
      expect(mediaResponse.ok()).toBeTruthy();

      // Check content type matches media type
      const contentType = mediaResponse.headers()["content-type"];
      if (item.media_type === "image") {
        expect(contentType).toContain("image/");
      }
    }
  });

  test("Should validate media metadata", async ({ request }) => {
    const response = await request.get(`${WP_JSON}/media?per_page=5`);
    const mediaItems = await response.json();

    mediaItems.forEach((item: any) => {
      expect(item.id).toBeGreaterThan(0);
      expect(item.source_url).toBeTruthy();
      expect(item.mime_type).toBeTruthy();
      expect(item.media_type).toBeTruthy();

      // Check media details exist
      expect(item).toHaveProperty("media_details");

      if (item.media_type === "image" && item.media_details) {
        expect(item.media_details).toHaveProperty("width");
        expect(item.media_details).toHaveProperty("height");
        expect(item.media_details.width).toBeGreaterThan(0);
        expect(item.media_details.height).toBeGreaterThan(0);
      }
    });
  });

  test("Should validate image sizes generation", async ({ request }) => {
    const response = await request.get(`${WP_JSON}/media?media_type=image&per_page=5`);
    const images = await response.json();

    for (const image of images) {
      if (image.media_details && image.media_details.sizes) {
        const sizes = image.media_details.sizes;

        // Common WordPress image sizes
        const commonSizes = ["thumbnail", "medium", "large"];

        for (const sizeName of commonSizes) {
          if (sizes[sizeName]) {
            expect(sizes[sizeName].source_url).toBeTruthy();

            // Verify sized image is accessible
            const sizeResponse = await request.get(sizes[sizeName].source_url);
            expect(sizeResponse.ok()).toBeTruthy();
          }
        }
      }
    }
  });

  test("Should verify media parent relationships", async ({ request }) => {
    const response = await request.get(`${WP_JSON}/media?per_page=10`);
    const mediaItems = await response.json();

    for (const item of mediaItems) {
      if (item.post && item.post > 0) {
        // Try to fetch parent post
        const postResponse = await request.get(`${WP_JSON}/posts/${item.post}`);
        const pageResponse = await request.get(`${WP_JSON}/pages/${item.post}`);

        // Should be either a post or page
        expect(postResponse.ok() || pageResponse.ok()).toBeTruthy();
      }
    }
  });
});

test.describe("WordPress Content - Taxonomy Integrity", () => {
  test("Should validate category hierarchy", async ({ request }) => {
    const response = await request.get(`${WP_JSON}/categories?per_page=50`);
    const categories = await response.json();

    for (const category of categories) {
      expect(category.id).toBeGreaterThan(0);
      expect(category.count).toBeGreaterThanOrEqual(0);

      // If has parent, verify parent exists
      if (category.parent > 0) {
        const parentResponse = await request.get(`${WP_JSON}/categories/${category.parent}`);
        expect(parentResponse.ok()).toBeTruthy();

        const parent = await parentResponse.json();
        expect(parent.id).toBe(category.parent);
      }
    }
  });

  test("Should validate category post counts", async ({ request }) => {
    const response = await request.get(`${WP_JSON}/categories?per_page=10`);
    const categories = await response.json();

    for (const category of categories) {
      if (category.count > 0) {
        const postsResponse = await request.get(
          `${WP_JSON}/posts?categories=${category.id}&per_page=100`
        );
        const posts = await postsResponse.json();

        // Note: count might include private posts, so actual count may be less
        expect(posts.length).toBeLessThanOrEqual(category.count);
      }
    }
  });

  test("Should validate tag consistency", async ({ request }) => {
    const response = await request.get(`${WP_JSON}/tags?per_page=20`);
    const tags = await response.json();

    tags.forEach((tag: any) => {
      expect(tag.id).toBeGreaterThan(0);
      expect(tag.name).toBeTruthy();
      expect(tag.slug).toBeTruthy();
      expect(tag.count).toBeGreaterThanOrEqual(0);
    });
  });

  test("Should verify tag post associations", async ({ request }) => {
    const response = await request.get(`${WP_JSON}/tags?per_page=5`);
    const tags = await response.json();

    for (const tag of tags) {
      if (tag.count > 0) {
        const postsResponse = await request.get(`${WP_JSON}/posts?tags=${tag.id}&per_page=1`);
        expect(postsResponse.ok()).toBeTruthy();

        const posts = await postsResponse.json();
        expect(Array.isArray(posts)).toBeTruthy();
      }
    }
  });
});

test.describe("WordPress Content - URL Consistency", () => {
  test("Should validate post permalink structure", async ({ request }) => {
    const response = await request.get(`${WP_JSON}/posts?per_page=10`);
    const posts = await response.json();

    posts.forEach((post: any) => {
      expect(post.link).toContain(BASE_URL);
      expect(post.link).toContain(post.slug);

      // URL should be well-formed
      expect(() => new URL(post.link)).not.toThrow();
    });
  });

  test("Should validate page permalink structure", async ({ request }) => {
    const response = await request.get(`${WP_JSON}/pages?per_page=10`);
    const pages = await response.json();

    pages.forEach((page: any) => {
      expect(page.link).toContain(BASE_URL);
      expect(() => new URL(page.link)).not.toThrow();
    });
  });

  test("Should verify post URLs are accessible", async ({ request }) => {
    const response = await request.get(`${WP_JSON}/posts?per_page=5`);
    const posts = await response.json();

    for (const post of posts) {
      const pageResponse = await request.get(post.link);
      expect(pageResponse.ok()).toBeTruthy();

      const html = await pageResponse.text();
      expect(html).toContain(post.title.rendered);
    }
  });

  test("Should verify page URLs are accessible", async ({ request }) => {
    const response = await request.get(`${WP_JSON}/pages?per_page=5`);
    const pages = await response.json();

    for (const page of pages) {
      const pageResponse = await request.get(page.link);
      expect(pageResponse.ok()).toBeTruthy();

      const html = await pageResponse.text();
      expect(html).toContain(page.title.rendered);
    }
  });
});

test.describe("WordPress Content - Data Sanitization", () => {
  test("Should properly encode HTML entities in titles", async ({ request }) => {
    const response = await request.get(`${WP_JSON}/posts?per_page=10`);
    const posts = await response.json();

    posts.forEach((post: any) => {
      // Rendered version should have proper HTML
      expect(post.title.rendered).toBeTruthy();

      // Should not contain unescaped HTML tags in plain text
      if (post.title.rendered.includes("&")) {
        expect(post.title.rendered).toMatch(/&[a-z]+;|&#\d+;/);
      }
    });
  });

  test("Should sanitize content output", async ({ request }) => {
    const response = await request.get(`${WP_JSON}/posts?per_page=5`);
    const posts = await response.json();

    posts.forEach((post: any) => {
      expect(post.content.rendered).toBeTruthy();

      // Content should not contain dangerous script patterns
      expect(post.content.rendered.toLowerCase()).not.toContain("javascript:");
      expect(post.content.rendered.toLowerCase()).not.toContain("onerror=");
      expect(post.content.rendered.toLowerCase()).not.toContain("onclick=");
    });
  });

  test("Should validate excerpt generation", async ({ request }) => {
    const response = await request.get(`${WP_JSON}/posts?per_page=10`);
    const posts = await response.json();

    posts.forEach((post: any) => {
      if (post.excerpt && post.excerpt.rendered) {
        // Excerpt should be shorter than content
        expect(post.excerpt.rendered.length).toBeLessThanOrEqual(
          post.content.rendered.length || Infinity
        );

        // Excerpt should not contain script tags
        expect(post.excerpt.rendered.toLowerCase()).not.toContain("<script");
      }
    });
  });
});

test.describe("WordPress Content - Comments Integrity", () => {
  test("Should validate comment-post relationships", async ({ request }) => {
    const response = await request.get(`${WP_JSON}/comments?per_page=10`);
    const comments = await response.json();

    for (const comment of comments) {
      expect(comment.post).toBeGreaterThan(0);

      // Verify the post exists
      const postResponse = await request.get(`${WP_JSON}/posts/${comment.post}`);
      expect(postResponse.ok()).toBeTruthy();
    }
  });

  test("Should validate comment hierarchy", async ({ request }) => {
    const response = await request.get(`${WP_JSON}/comments?per_page=20`);
    const comments = await response.json();

    for (const comment of comments) {
      if (comment.parent > 0) {
        // Verify parent comment exists
        const parentResponse = await request.get(`${WP_JSON}/comments/${comment.parent}`);
        expect(parentResponse.ok()).toBeTruthy();

        const parent = await parentResponse.json();
        expect(parent.id).toBe(comment.parent);

        // Parent should be on same post
        expect(parent.post).toBe(comment.post);
      }
    }
  });

  test("Should validate comment dates", async ({ request }) => {
    const response = await request.get(`${WP_JSON}/comments?per_page=10`);
    const comments = await response.json();

    comments.forEach((comment: any) => {
      const commentDate = new Date(comment.date);
      expect(commentDate.getTime()).toBeGreaterThan(0);

      // Comment date should be in the past
      expect(commentDate.getTime()).toBeLessThanOrEqual(Date.now());
    });
  });
});
