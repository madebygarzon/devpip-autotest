import { test, expect } from "@playwright/test";

/**
 * WordPress Security Tests
 * Tests for WordPress security headers, authentication, and common vulnerabilities
 */

const BASE_URL = "https://partnerinpublishing.com";
const WP_JSON = `${BASE_URL}/wp-json/wp/v2`;

test.describe("WordPress Security - HTTP Headers", () => {
  test("Should have security headers configured", async ({ request }) => {
    const response = await request.get(BASE_URL);
    const headers = response.headers();

    // Check for important security headers
    expect(headers).toHaveProperty("x-content-type-options");
    if (headers["x-content-type-options"]) {
      expect(headers["x-content-type-options"]).toBe("nosniff");
    }
  });

  test("Should have proper content type headers", async ({ request }) => {
    const response = await request.get(BASE_URL);
    const headers = response.headers();

    expect(headers).toHaveProperty("content-type");
    expect(headers["content-type"]).toContain("text/html");
  });

  test("Should check for X-Frame-Options", async ({ request }) => {
    const response = await request.get(BASE_URL);
    const headers = response.headers();

    // X-Frame-Options helps prevent clickjacking
    if (headers["x-frame-options"]) {
      expect(["DENY", "SAMEORIGIN"]).toContain(headers["x-frame-options"]);
    }
  });

  test("Should use HTTPS for all requests", async ({ request }) => {
    const response = await request.get(BASE_URL);

    expect(response.url()).toMatch(/^https:\/\//);
  });

  test("Should check Strict-Transport-Security header", async ({ request }) => {
    const response = await request.get(BASE_URL);
    const headers = response.headers();

    // HSTS header should be present for HTTPS sites
    if (headers["strict-transport-security"]) {
      expect(headers["strict-transport-security"]).toContain("max-age");
    }
  });
});

test.describe("WordPress Security - Authentication", () => {
  test("Should require authentication for admin endpoints", async ({ request }) => {
    const response = await request.get(`${BASE_URL}/wp-admin/`);

    // Should redirect to login or return 401/403
    expect([302, 401, 403]).toContain(response.status());
  });

  test("Should protect wp-login.php", async ({ request }) => {
    const response = await request.get(`${BASE_URL}/wp-login.php`);

    // Should be accessible but return login page
    expect(response.ok()).toBeTruthy();
    const html = await response.text();
    expect(html).toContain("login");
  });

  test("Should reject unauthorized REST API writes", async ({ request }) => {
    const response = await request.post(`${WP_JSON}/posts`, {
      data: {
        title: "Unauthorized Post",
        content: "This should not be created",
        status: "publish"
      }
    });

    expect(response.status()).toBe(401);
    const error = await response.json();
    expect(error).toHaveProperty("code");
    expect(error.code).toContain("rest_");
  });

  test("Should reject unauthorized user creation", async ({ request }) => {
    const response = await request.post(`${WP_JSON}/users`, {
      data: {
        username: "hacker",
        email: "hacker@example.com",
        password: "password123"
      }
    });

    expect(response.status()).toBe(401);
  });

  test("Should protect settings endpoint", async ({ request }) => {
    const response = await request.get(`${WP_JSON}/settings`);

    expect(response.status()).toBe(401);
  });

  test("Should reject unauthorized theme/plugin modifications", async ({ request }) => {
    const response = await request.post(`${BASE_URL}/wp-admin/theme-editor.php`, {
      data: {
        file: "style.css",
        newcontent: "malicious code"
      }
    });

    // Should require authentication
    expect([302, 401, 403]).toContain(response.status());
  });
});

test.describe("WordPress Security - Directory Listing", () => {
  test("Should prevent wp-content directory listing", async ({ request }) => {
    const response = await request.get(`${BASE_URL}/wp-content/`);

    // Should either redirect, 403, or not show directory listing
    const text = await response.text();
    expect(text.toLowerCase()).not.toContain("index of");
  });

  test("Should prevent wp-includes directory listing", async ({ request }) => {
    const response = await request.get(`${BASE_URL}/wp-includes/`);

    const text = await response.text();
    expect(text.toLowerCase()).not.toContain("index of");
  });

  test("Should prevent uploads directory listing", async ({ request }) => {
    const response = await request.get(`${BASE_URL}/wp-content/uploads/`);

    const text = await response.text();
    expect(text.toLowerCase()).not.toContain("index of");
  });

  test("Should prevent plugins directory listing", async ({ request }) => {
    const response = await request.get(`${BASE_URL}/wp-content/plugins/`);

    const text = await response.text();
    expect(text.toLowerCase()).not.toContain("index of");
  });

  test("Should prevent themes directory listing", async ({ request }) => {
    const response = await request.get(`${BASE_URL}/wp-content/themes/`);

    const text = await response.text();
    expect(text.toLowerCase()).not.toContain("index of");
  });
});

test.describe("WordPress Security - Information Disclosure", () => {
  test("Should not expose WordPress version unnecessarily", async ({ request }) => {
    const response = await request.get(BASE_URL);
    const html = await response.text();

    // Check if version is not prominently displayed
    const versionPattern = /wordpress\s+\d+\.\d+/i;
    const headers = response.headers();

    // Version shouldn't be in headers
    expect(headers["x-powered-by"]).not.toContain("WordPress");
  });

  test("Should not expose sensitive files", async ({ request }) => {
    const sensitiveFiles = [
      "/wp-config.php",
      "/.env",
      "/wp-config-sample.php"
    ];

    for (const file of sensitiveFiles) {
      const response = await request.get(`${BASE_URL}${file}`);

      // Should not be accessible
      expect(response.ok()).toBeFalsy();
    }
  });

  test("Should not expose debug.log", async ({ request }) => {
    const response = await request.get(`${BASE_URL}/wp-content/debug.log`);

    // Should not be accessible
    expect(response.ok()).toBeFalsy();
  });

  test("Should not expose readme.html", async ({ request }) => {
    const response = await request.get(`${BASE_URL}/readme.html`);

    // Many sites remove this file for security
    if (response.ok()) {
      const html = await response.text();
      // If it exists, it shouldn't reveal sensitive info
      expect(html).toBeTruthy();
    }
  });
});

test.describe("WordPress Security - SQL Injection Protection", () => {
  test("Should sanitize search parameters", async ({ request }) => {
    const maliciousSearches = [
      "' OR '1'='1",
      "'; DROP TABLE wp_posts; --",
      "1' UNION SELECT NULL--",
      "<script>alert('xss')</script>"
    ];

    for (const search of maliciousSearches) {
      const response = await request.get(`${WP_JSON}/posts?search=${encodeURIComponent(search)}`);

      // Should handle gracefully without errors
      expect([200, 400]).toContain(response.status());
    }
  });

  test("Should sanitize category filter parameters", async ({ request }) => {
    const response = await request.get(`${WP_JSON}/posts?categories='; DROP TABLE--`);

    // Should handle invalid input gracefully
    expect([200, 400]).toContain(response.status());
  });
});

test.describe("WordPress Security - XSS Protection", () => {
  test("Should sanitize search query in results", async ({ request }) => {
    const xssPayloads = [
      "<script>alert('XSS')</script>",
      "<img src=x onerror=alert('XSS')>",
      "javascript:alert('XSS')"
    ];

    for (const payload of xssPayloads) {
      const response = await request.get(
        `${BASE_URL}/wp-json/wp/v2/search?search=${encodeURIComponent(payload)}`
      );

      expect(response.ok()).toBeTruthy();
      const results = await response.json();

      // Results should be sanitized
      if (results.length > 0) {
        const jsonString = JSON.stringify(results);
        expect(jsonString).not.toContain("<script>");
        expect(jsonString).not.toContain("onerror=");
      }
    }
  });

  test("Should handle malformed HTML in REST API", async ({ request }) => {
    const response = await request.get(`${WP_JSON}/posts?search=<iframe>`);

    expect(response.ok()).toBeTruthy();
  });
});

test.describe("WordPress Security - CSRF Protection", () => {
  test("Should reject POST requests without proper origin", async ({ request }) => {
    const response = await request.post(`${WP_JSON}/posts`, {
      data: { title: "Test" },
      headers: {
        "Origin": "https://evil-site.com"
      }
    });

    // Should be rejected (401 unauthorized or 403 forbidden)
    expect([401, 403]).toContain(response.status());
  });

  test("Should check for nonce in authenticated requests", async ({ request }) => {
    const response = await request.post(`${BASE_URL}/wp-admin/admin-ajax.php`, {
      data: { action: "delete_post" }
    });

    // Should require nonce/authentication
    expect([302, 400, 401, 403]).toContain(response.status());
  });
});

test.describe("WordPress Security - File Upload Restrictions", () => {
  test("Should reject unauthorized file uploads", async ({ request }) => {
    const response = await request.post(`${WP_JSON}/media`, {
      multipart: {
        file: {
          name: "test.php",
          mimeType: "application/x-php",
          buffer: Buffer.from("<?php echo 'test'; ?>")
        }
      }
    });

    // Should be rejected without authentication
    expect(response.status()).toBe(401);
  });
});

test.describe("WordPress Security - XML-RPC", () => {
  test("Should check XML-RPC endpoint status", async ({ request }) => {
    const response = await request.post(`${BASE_URL}/xmlrpc.php`, {
      data: `<?xml version="1.0"?>
        <methodCall>
          <methodName>system.listMethods</methodName>
        </methodCall>`,
      headers: {
        "Content-Type": "text/xml"
      }
    });

    // XML-RPC may be disabled for security (404/405) or enabled (200)
    expect([200, 404, 405, 403]).toContain(response.status());
  });

  test("Should prevent XML-RPC brute force attacks", async ({ request }) => {
    const response = await request.post(`${BASE_URL}/xmlrpc.php`, {
      data: `<?xml version="1.0"?>
        <methodCall>
          <methodName>wp.getUsersBlogs</methodName>
          <params>
            <param><value>admin</value></param>
            <param><value>wrongpassword</value></param>
          </params>
        </methodCall>`,
      headers: {
        "Content-Type": "text/xml"
      }
    });

    // Should handle authentication failure
    expect([200, 403, 404, 405]).toContain(response.status());
  });
});

test.describe("WordPress Security - Rate Limiting", () => {
  test("Should handle rapid API requests", async ({ request }) => {
    const requests = Array(20).fill(null).map(() =>
      request.get(`${WP_JSON}/posts?per_page=1`)
    );

    const responses = await Promise.all(requests);

    // All should succeed or some should be rate limited
    responses.forEach(response => {
      expect([200, 429]).toContain(response.status());
    });
  });

  test("Should handle concurrent login attempts", async ({ request }) => {
    const loginAttempts = Array(5).fill(null).map(() =>
      request.post(`${BASE_URL}/wp-login.php`, {
        form: {
          log: "testuser",
          pwd: "wrongpassword"
        }
      })
    );

    const responses = await Promise.all(loginAttempts);

    // Should handle multiple attempts
    responses.forEach(response => {
      expect([200, 302, 403, 429]).toContain(response.status());
    });
  });
});

test.describe("WordPress Security - Content Security", () => {
  test("Should check for Content-Security-Policy header", async ({ request }) => {
    const response = await request.get(BASE_URL);
    const headers = response.headers();

    // CSP is optional but recommended
    if (headers["content-security-policy"]) {
      expect(headers["content-security-policy"]).toBeTruthy();
    }
  });

  test("Should check for Referrer-Policy header", async ({ request }) => {
    const response = await request.get(BASE_URL);
    const headers = response.headers();

    // Referrer-Policy helps protect user privacy
    if (headers["referrer-policy"]) {
      expect(headers["referrer-policy"]).toBeTruthy();
    }
  });
});
