# WordPress Backend API Tests

This directory contains comprehensive backend tests for the WordPress-powered Partner in Publishing website.

## Test Files Overview

### 1. `wordpress-rest-api.spec.ts`
Tests for core WordPress REST API functionality.

**Coverage:**
- Core API endpoint accessibility (posts, pages, media, categories, tags, users)
- Data structure validation
- Pagination and query parameters
- Error handling for invalid requests
- Performance benchmarks for API responses

**Key Test Groups:**
- WordPress REST API - Core Endpoints
- WordPress REST API - Data Validation
- WordPress REST API - Performance
- WordPress REST API - Pagination
- WordPress REST API - Query Parameters
- WordPress REST API - Error Handling

### 2. `wordpress-backend-endpoints.spec.ts`
Tests for WordPress backend-specific functionality and advanced features.

**Coverage:**
- Custom post types detection and validation
- Taxonomy system (categories, tags, custom taxonomies)
- Settings endpoint security
- Global search functionality
- Block Editor (Gutenberg) support
- Comments API
- Revisions and autosaves
- Theme and plugin detection
- oEmbed support

**Key Test Groups:**
- WordPress Backend - Custom Post Types
- WordPress Backend - Taxonomies
- WordPress Backend - Settings Endpoints
- WordPress Backend - Search Functionality
- WordPress Backend - Block Editor (Gutenberg) Support
- WordPress Backend - Comments API
- WordPress Backend - Revisions
- WordPress Backend - Theme and Plugin Detection
- WordPress Backend - Embed Support

### 3. `wordpress-security.spec.ts`
Comprehensive security testing for WordPress installation.

**Coverage:**
- Security headers (X-Content-Type-Options, X-Frame-Options, HSTS)
- Authentication and authorization
- Directory listing prevention
- Information disclosure prevention
- SQL injection protection
- XSS (Cross-Site Scripting) protection
- CSRF (Cross-Site Request Forgery) protection
- File upload restrictions
- XML-RPC security
- Rate limiting
- Content Security Policy

**Key Test Groups:**
- WordPress Security - HTTP Headers
- WordPress Security - Authentication
- WordPress Security - Directory Listing
- WordPress Security - Information Disclosure
- WordPress Security - SQL Injection Protection
- WordPress Security - XSS Protection
- WordPress Security - CSRF Protection
- WordPress Security - File Upload Restrictions
- WordPress Security - XML-RPC
- WordPress Security - Rate Limiting
- WordPress Security - Content Security

### 4. `wordpress-content-integrity.spec.ts`
Tests for data consistency, relationships, and content integrity.

**Coverage:**
- Post data consistency and validation
- Author relationships
- Category and tag associations
- Featured image relationships
- Page hierarchy validation
- Media library integrity
- Taxonomy consistency
- URL structure and accessibility
- Data sanitization
- Comment relationships and hierarchy

**Key Test Groups:**
- WordPress Content - Posts Integrity
- WordPress Content - Pages Integrity
- WordPress Content - Media Library Integrity
- WordPress Content - Taxonomy Integrity
- WordPress Content - URL Consistency
- WordPress Content - Data Sanitization
- WordPress Content - Comments Integrity

### 5. `wordpress-performance.spec.ts`
Performance optimization and caching tests.

**Coverage:**
- Response time benchmarks
- HTTP caching headers (ETag, Cache-Control, Last-Modified)
- Content compression (gzip, brotli)
- Image optimization
- Database query efficiency
- Concurrent request handling
- Asset optimization (CSS, JavaScript)
- Page load optimization
- Resource hints
- CDN usage
- Pagination efficiency

**Key Test Groups:**
- WordPress Performance - Response Times
- WordPress Performance - Caching Headers
- WordPress Performance - Content Delivery
- WordPress Performance - Database Optimization
- WordPress Performance - Concurrent Requests
- WordPress Performance - Asset Optimization
- WordPress Performance - Page Load Optimization
- WordPress Performance - Resource Hints
- WordPress Performance - CDN Usage
- WordPress Performance - Database Query Efficiency

## Running the Tests

### Run all backend API tests:
```bash
npx playwright test tests/pip/api/
```

### Run specific test file:
```bash
npx playwright test tests/pip/api/wordpress-rest-api.spec.ts
npx playwright test tests/pip/api/wordpress-security.spec.ts
npx playwright test tests/pip/api/wordpress-performance.spec.ts
```

### Run tests in UI mode:
```bash
npx playwright test tests/pip/api/ --ui
```

### Run tests with detailed reporting:
```bash
npx playwright test tests/pip/api/ --reporter=html
```

## Test Configuration

All tests use the base URL: `https://partnerinpublishing.com`

The tests are designed to:
- Work with production WordPress sites
- Not require authentication (tests public endpoints)
- Handle cases where certain features may not be available
- Validate data structures and relationships
- Check security best practices
- Measure performance benchmarks

## Performance Benchmarks

Expected response times:
- Homepage: < 3 seconds
- REST API root: < 2 seconds
- Posts/Pages endpoints: < 2 seconds
- Single item retrieval: < 1 second
- Large result sets (100 items): < 4 seconds
- Concurrent requests (5 endpoints): < 5 seconds

## Security Checks

The security tests verify:
- ✓ HTTPS enforcement
- ✓ Authentication for protected endpoints
- ✓ Directory listing prevention
- ✓ Sensitive file protection
- ✓ SQL injection protection
- ✓ XSS protection
- ✓ CSRF protection
- ✓ Rate limiting
- ✓ Proper error handling

## Data Integrity Checks

Content integrity tests ensure:
- ✓ Valid relationships between posts, authors, categories, and tags
- ✓ Consistent URL structures
- ✓ Accessible media files
- ✓ Proper data sanitization
- ✓ Valid date/time values
- ✓ Correct pagination headers
- ✓ Valid comment hierarchies
- ✓ Proper HTML entity encoding

## Best Practices

When adding new backend tests:

1. **Use the Request API**: All these tests use Playwright's `request` context for direct API testing
2. **Handle Optional Features**: Use conditional checks for features that may not exist
3. **Test Relationships**: Verify that related data (author, categories, media) exists and is accessible
4. **Check Both Success and Failure**: Test both valid responses and error handling
5. **Consider Performance**: Add timing checks for critical endpoints
6. **Validate Data Structure**: Ensure all required fields are present
7. **Test Security**: Always verify authentication and authorization

## Troubleshooting

### Common Issues

1. **Rate Limiting**: If tests fail due to too many requests, add delays between test runs
2. **Timeouts**: Adjust timeout values in playwright.config.ts if the server is slow
3. **Authentication Required**: Some endpoints may require authentication in production
4. **Custom Post Types**: Validation may need adjustment based on site-specific custom post types

## Contributing

When adding new backend tests:
1. Follow the existing file naming pattern
2. Group related tests in describe blocks
3. Add descriptive test names
4. Include comments for complex validations
5. Update this README with new test coverage
6. Ensure tests work with live WordPress sites

## Related Documentation

- [WordPress REST API Handbook](https://developer.wordpress.org/rest-api/)
- [WordPress Security Best Practices](https://wordpress.org/support/article/hardening-wordpress/)
- [Playwright API Testing](https://playwright.dev/docs/api-testing)
