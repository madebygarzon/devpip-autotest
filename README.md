# DevPiP AutoTest Suite

E2E automated testing platform with modern web dashboard to execute, monitor, and analyze Playwright tests across multiple projects.

## Technology Stack

### Frontend & Framework
- **Next.js 15.4.2** - React framework with App Router and Turbopack
- **React 19.1.0** - UI library with RSC (React Server Components)
- **TypeScript 5** - Static typing
- **Tailwind CSS 4** - Utility-first CSS framework with PostCSS
- **Radix UI** - Accessible headless components:
  - Dialog, Dropdown Menu, Select, Tabs, Tooltip
  - Collapsible, Label, Separator, Slot
- **Lucide React** - Icon system
- **class-variance-authority** + **clsx** + **tailwind-merge** - Class management
- **Recharts 3.1** - Data visualization and charts

### Testing
- **Playwright 1.54** - E2E testing framework
  - Multi-project configuration (pip, gradepotential, itopia, metricmarine)
  - Screenshots and videos on failure (`only-on-failure`)
  - Traces for debugging (`retain-on-failure`)
  - Interactive HTML reports
  - Headless mode by default

### Database & ORM
- **PostgreSQL** - Relational database
- **Prisma 7.2.0** - TypeScript-first ORM
  - `@prisma/client` - Generated client
  - `@prisma/extension-accelerate` - Connection pooling and caching
  - Schema with models for:
    - Projects and test runs
    - Media (screenshots, videos)
    - Test errors
    - Microsoft Clarity analytics

### State Management & Data Fetching
- **SWR 2.3** - React Hooks for data fetching and caching
  - Automatic revalidation
  - Optimistic cache
  - Real-time updates

### External Integrations
- **Microsoft Clarity API** - Analytics and session replay
  - Engagement metrics
  - Device/Browser/OS breakdown
  - Geolocation
  - Traffic sources
- **DeepSeek AI** - Chat assistant for error analysis
- **HubSpot** - Form validation

### Utilities
- **Cheerio 1.1** - jQuery for Node.js (HTML parsing)
- **Fuse.js 7.0** - Fuzzy search
- **PapaParse 5.5** - CSV parser
- **SweetAlert2 11.22** - Elegant modals and alerts
- **dotenv 17.2** - Environment variables

### Dev Dependencies
- **ESLint 9** + **eslint-config-next**
- **tsx 4.21** - TypeScript executor for scripts
- **tw-animate-css** - Tailwind animations

## System Architecture

```
devpip-autotest/
├── src/
│   ├── app/                           # Next.js App Router
│   │   ├── api/                       # API Routes
│   │   │   ├── run-test/route.ts      # POST: Execute tests via spawn
│   │   │   ├── download-report/route.ts # GET: Download ZIP reports
│   │   │   ├── deepseek/route.ts      # POST: AI Chat
│   │   │   └── clarity/               # Clarity API endpoints
│   │   │       ├── metrics/route.ts
│   │   │       ├── devices/route.ts
│   │   │       ├── countries/route.ts
│   │   │       └── sources/route.ts
│   │   ├── page.tsx                   # Main dashboard (Client Component)
│   │   ├── layout.tsx                 # Root layout
│   │   └── globals.css                # Tailwind global styles
│   ├── components/
│   │   ├── ui/                        # Radix UI wrappers
│   │   │   ├── sidebar.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── tabs.tsx
│   │   │   └── ...
│   │   ├── dashboard/                 # Clarity dashboard
│   │   │   ├── ClarityDevicesChart.tsx
│   │   │   ├── ClarityCountriesChart.tsx
│   │   │   └── ClarityTrafficSources.tsx
│   │   ├── TestContent.tsx            # Test runner UI
│   │   ├── TestHistory.tsx            # History with filters and search
│   │   ├── ClarityDashboardContent.tsx
│   │   └── AIChat.tsx                 # DeepSeek chat
│   ├── lib/
│   │   └── db.ts                      # Prisma client + query helpers
│   └── generated/
│       └── prisma/                    # Generated Prisma client
├── tests/                             # Playwright tests organized by project
│   ├── pip/
│   │   ├── home/                      # Form, hero, menu, carousel, etc.
│   │   ├── about/                     # Team, videos, leadership
│   │   ├── services/                  # Services pages
│   │   ├── common/                    # Footer, popups, SEO, analytics
│   │   └── api/                       # WordPress REST API, security
│   ├── gradepotential/
│   ├── itopia/
│   └── metricmarine/
├── prisma/
│   ├── schema.prisma                  # Database schema
│   └── migrations/                    # SQL migrations
├── public/
│   └── reports/                       # HTML reports served statically
│       ├── pip/
│       ├── gradepotential/
│       ├── itopia/
│       └── metricmarine/
├── playwright-report/                 # Local generated report
├── test-results/                      # Screenshots/videos from failures
├── playwright.config.ts               # Playwright configuration
├── tailwind.config.ts                 # Tailwind configuration
└── tsconfig.json                      # TypeScript config
```

## Main Features

### 1. Test Runner with Streaming
- Execution of individual tests or complete suites
- Real-time output streaming via `ReadableStream`
- Node process spawn (`npx playwright test`)
- Output parsing with ANSI code detection
- Automatic friendly post-test explanations
- HTML report generation with custom favicon

**Flow:**
```
Client → POST /api/run-test → spawn playwright → stream output →
copy report → extract media → save to DB → response close
```

### 2. History Persistence
- All test runs saved to PostgreSQL
- Prisma relationships:
  ```prisma
  Project 1—n TestRun 1—n (TestMedia | TestError)
  ```
- Optimized queries with indexes on `projectId`, `createdAt`, `testPath`
- Legacy ID support for backward compatibility
- Cascade delete for automatic cleanup

### 3. Clarity Analytics Dashboard
- Daily snapshots of aggregated metrics
- Dimensional breakdown:
  - Devices (Desktop, Mobile, Tablet)
  - Browsers (Chrome, Firefox, Safari, etc.)
  - Operating Systems (Windows, macOS, iOS, Android)
  - Countries (ISO codes)
  - Traffic sources and channels
  - Top pages and referrers
- UX Metrics:
  - Rage clicks, dead clicks, quick backs
  - Scroll depth, engagement time
  - Script errors, error clicks
- Configurable API strategies: `minimal`, `balanced`, `full`

### 4. Contextual AI Chat
- DeepSeek API integration
- Automatic context from test errors
- Floating modal with animations
- Markdown rendering
- Auto-truncate for long prompts (4000 chars)

## Configuration

### Requirements
- Node.js 20+
- PostgreSQL 14+
- npm/pnpm/yarn

### Environment Variables

```bash
# .env
DEEPSEEK_API_KEY=your_api_key

# Database - Direct connection
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"

# Prisma Accelerate (optional, for better performance)
PRISMA_DATABASE_URL="prisma+postgresql://accelerate.prisma-data.net/?api_key=xxx"

# Compatibility
POSTGRES_URL="postgresql://..."

# Microsoft Clarity
CLARITY_PROJECT_ID=your_project_id
CLARITY_TOKEN=your_token

# API Strategy: minimal (2 calls) | balanced (3) | full (5)
CLARITY_API_STRATEGY=minimal
NEXT_PUBLIC_CLARITY_API_STRATEGY=minimal
```

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma Client
npx prisma generate

# 3. Run migrations
npx prisma migrate dev --name init

# 4. (Optional) Initial seed
npx tsx scripts/seed.ts

# 5. Install Playwright browsers
npx playwright install
```

### Scripts

```bash
npm run dev        # Next.js dev with Turbopack (port 3000)
npm run build      # Production build
npm run start      # Production server
npm run lint       # ESLint
npm run test       # Run Playwright tests
```

## Usage

### 1. Run Tests from UI

```
http://localhost:3000
```

1. Select project (pip, gradepotential, itopia, metricmarine)
2. Optionally specify test path (e.g., `tests/pip/home/form.spec.ts`)
3. Click "Run Tests"
4. View output in real-time
5. Click "View Report" to see detailed HTML

### 2. Run Tests from CLI

```bash
# All tests for a project
npx playwright test --project pip

# Specific test
npx playwright test tests/pip/home/form.spec.ts --project pip

# With headed mode (show browser)
npx playwright test --headed --project pip

# Debug mode with inspector
npx playwright test --debug tests/pip/home/form.spec.ts

# Interactive UI mode
npx playwright test --ui
```

### 3. Access Reports

- **Local:** `playwright-report/index.html`
- **Web:** `http://localhost:3000/reports/{project}/index.html`
- **Download:** API endpoint `/api/download-report?testRunId=xxx`

### 4. Clarity Dashboard

Navigate to the "Clarity Dashboard" section to view:
- Aggregated metrics (sessions, users, engagement)
- Device and browser charts
- Country map
- Traffic sources
- Top pages

## Execution Flow

### Test Run Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant API as /api/run-test
    participant PW as Playwright
    participant FS as File System
    participant DB as PostgreSQL

    U->>F: Click "Run Tests"
    F->>API: POST {testPath, project}
    API->>PW: spawn npx playwright test
    loop Streaming
        PW->>API: stdout/stderr chunks
        API->>F: stream output
    end
    PW->>FS: Generate HTML report
    API->>FS: Copy to public/reports
    API->>FS: Extract media assets
    API->>DB: Save TestRun + Media + Errors
    API->>F: Close stream
    F->>U: Show report link
```

### Clarity Sync Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend (SWR)
    participant API as /api/clarity
    participant C as Clarity API
    participant DB as PostgreSQL

    U->>F: Open Clarity Dashboard
    F->>API: GET /api/clarity/metrics
    API->>DB: Check latest snapshot
    alt Cached (< 24h)
        DB->>API: Return snapshot
    else Stale/Missing
        API->>C: Fetch metrics
        C->>API: Return data
        API->>DB: Create snapshot
        DB->>API: Return snapshot
    end
    API->>F: JSON response
    F->>U: Render charts
```

## API Routes

### `POST /api/run-test`

Execute Playwright tests with real-time streaming.

**Request:**
```json
{
  "testPath": "tests/pip/home/form.spec.ts",  // Optional: "" = all tests
  "project": "pip"                            // Required
}
```

**Response:** `text/plain; charset=utf-8` with streaming

**Process:**
1. Spawn `npx playwright test {args}`
2. Stream stdout/stderr with ANSI strip
3. Generate HTML report
4. Copy to `public/reports/{project}/`
5. Customize title and favicon
6. Extract media (screenshots, videos) to `assets/`
7. Parse results (passed, failed, errors)
8. Save to DB
9. Close stream

### `GET /api/download-report?testRunId={id}`

Download report as ZIP.

### `POST /api/deepseek`

AI Chat.

**Request:**
```json
{
  "prompt": "Why did my test fail?"
}
```

**Response:**
```json
{
  "choices": [
    {
      "message": {
        "content": "Based on the error..."
      }
    }
  ]
}
```

### `GET /api/clarity/metrics`

Clarity aggregated metrics.

**Response:**
```json
{
  "sessions": 1234,
  "distinctUsers": 567,
  "engagementTimeAvg": 45.2,
  "scrollDepthAvg": 68.5,
  "rageClicks": 12,
  "deadClicks": 34,
  ...
}
```

### `GET /api/clarity/devices`

Device breakdown.

**Response:**
```json
[
  { "deviceType": "Desktop", "sessions": 800 },
  { "deviceType": "Mobile", "sessions": 400 },
  { "deviceType": "Tablet", "sessions": 34 }
]
```

## Data Model

### Core Models

```prisma
model Project {
  id          String    @id @default(cuid())
  name        String    @unique
  url         String
  description String?
  favicon     String?
  testRuns    TestRun[]
}

model TestRun {
  id          String      @id @default(cuid())
  legacyId    BigInt?     @unique
  testPath    String
  passed      Int         @default(0)
  failed      Int         @default(0)
  duration    Int?
  createdAt   DateTime    @default(now())
  projectId   String
  project     Project     @relation(fields: [projectId], references: [id], onDelete: Cascade)
  media       TestMedia[]
  errors      TestError[]

  @@index([projectId, createdAt, testPath])
}

model TestMedia {
  id        String    @id @default(cuid())
  type      MediaType // SCREENSHOT | VIDEO
  url       String
  fileName  String
  testRunId String
  testRun   TestRun   @relation(fields: [testRunId], references: [id], onDelete: Cascade)
}

model TestError {
  id        String   @id @default(cuid())
  message   String   @db.Text
  stack     String?  @db.Text
  testRunId String
  testRun   TestRun  @relation(fields: [testRunId], references: [id], onDelete: Cascade)
}
```

### Clarity Models

```prisma
model ClaritySnapshot {
  id                  String            @id @default(cuid())
  date                DateTime          @unique @db.Date
  sessions            Int
  distinctUsers       Int
  engagementTimeAvg   Float
  scrollDepthAvg      Float
  rageClicks          Int
  deadClicks          Int
  quickBackClicks     Int
  excessiveScrolls    Int
  scriptErrors        Int
  errorClicks         Int
  devices             ClarityDevice[]
  browsers            ClarityBrowser[]
  operatingSystems    ClarityOS[]
  countries           ClarityCountry[]
  sources             ClaritySource[]
  channels            ClarityChannel[]
  pages               ClarityPage[]
  referrers           ClarityReferrer[]

  @@index([date(sort: Desc)])
}

model ClarityDevice {
  snapshotId String
  snapshot   ClaritySnapshot @relation(fields: [snapshotId], references: [id], onDelete: Cascade)
  deviceType String
  sessions   Int

  @@unique([snapshotId, deviceType])
}

// ... similar for Browser, OS, Country, Source, Channel, Page, Referrer
```

## Test Structure

Tests follow the **AAA** pattern (Arrange, Act, Assert):

```typescript
import { test, expect } from "@playwright/test";

const BASE_URL = "/";

test("Contact form fields are functional", async ({ page }) => {
  // Arrange
  await page.goto(BASE_URL);

  // Act
  const form = page.locator("#contact-form");
  await expect(form).toBeVisible();

  await page.fill("#name", "Test User");
  await page.fill("#email", "test@example.com");
  await page.fill("#message", "Test message");

  // Assert
  const submitButton = page.locator("#submit");
  await expect(submitButton).toBeEnabled();

  await submitButton.click();
  const confirmation = page.locator(".success-message");
  await expect(confirmation).toBeVisible();
});
```

### Test Categories

```
tests/
├── pip/
│   ├── home/
│   │   ├── form.spec.ts                    # Contact form
│   │   ├── form-validation.spec.ts          # Validations
│   │   ├── form-validation-hubspot.spec.ts  # HubSpot integration
│   │   ├── hero-section.spec.ts             # Hero and CTAs
│   │   ├── carousel-animation.spec.ts       # Animations
│   │   ├── menu-links.spec.ts               # Navigation
│   │   ├── menu-links-footer.spec.ts        # Footer
│   │   ├── mobile-menu.spec.ts              # Mobile menu
│   │   ├── home-cards-navigation.spec.ts    # Cards
│   │   ├── home-anchor.spec.ts              # Anchors
│   │   ├── accessibility.spec.ts            # WCAG
│   │   └── performance.spec.ts              # Core Web Vitals
│   ├── about/
│   │   ├── hero-cta.spec.ts
│   │   ├── videos-visible.spec.ts
│   │   ├── leadership-tiers.spec.ts
│   │   ├── team-pip.spec.ts
│   │   └── about-anchor.spec.ts
│   ├── services/
│   │   └── services-links.spec.ts
│   ├── common/
│   │   ├── analytics-tracking.spec.ts       # GTM, Clarity
│   │   ├── seo-metadata.spec.ts             # Meta tags, OG
│   │   ├── footer.spec.ts
│   │   └── popups-modals.spec.ts
│   └── api/
│       ├── wordpress-rest-api.spec.ts       # REST API
│       ├── wordpress-backend-endpoints.spec.ts
│       ├── wordpress-security.spec.ts       # OWASP Top 10
│       ├── wordpress-content-integrity.spec.ts
│       └── wordpress-performance.spec.ts
├── gradepotential/
├── itopia/
└── metricmarine/
```

## Playwright Configuration

```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './tests',
  reporter: [['html', { outputFolder: 'playwright-report', open: 'never' }]],
  outputDir: 'test-results',

  use: {
    headless: true,
    ignoreHTTPSErrors: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },

  projects: [
    {
      name: 'pip',
      use: { baseURL: 'https://partnerinpublishing.com/' },
    },
    {
      name: 'gradepotential',
      use: { baseURL: 'https://www.gradepotentialtutoring.com' },
    },
    // ...
  ],
});
```

## Performance Optimization

### Frontend
- **SWR** for aggressive caching of test history and Clarity data
- **Next.js Image** for image optimization
- **Turbopack** for ultra-fast dev builds
- **React Server Components** to reduce bundle size
- **Code splitting** automatic via Next.js

### Database
- **Prisma Accelerate** for global connection pooling
- **Strategic indexes** on frequent queries
- **Cascade delete** to avoid orphaned records
- **Unique constraints** to prevent duplicates

### Playwright
- **Headless mode** by default
- **Screenshot/video** only on failures
- **Trace** only on failures
- **Parallel execution** (configurable in `playwright.config.ts`)

## Production

### Build & Deploy

```bash
# Build Next.js
npm run build

# Required environment variables in production
DATABASE_URL
PRISMA_DATABASE_URL  # Recommended for Accelerate
DEEPSEEK_API_KEY
CLARITY_PROJECT_ID
CLARITY_TOKEN
CLARITY_API_STRATEGY

# Start server
npm run start
```

### Considerations

- **Auth:** Add authentication middleware in production
- **HTTPS:** Reverse proxy (nginx, Cloudflare)
- **CORS:** Configure for your domain
- **Rate Limiting:** Clarity and DeepSeek API routes
- **Database:** SSL connection required, connection pooling
- **Monitoring:** Error logs, APM (Sentry, Datadog)
- **Backups:** Automatic PostgreSQL backups

## Development

### Adding a New Project

1. **Configure Playwright:**
```typescript
// playwright.config.ts
projects: [
  {
    name: 'my-project',
    use: { baseURL: 'https://my-site.com' },
  },
]
```

2. **Create tests:**
```bash
mkdir tests/my-project
mkdir tests/my-project/home
touch tests/my-project/home/form.spec.ts
```

3. **Add to UI:**
```typescript
// src/app/api/run-test/route.ts
const PROJECT_CONFIGS: Record<string, { favicon: string; title: string }> = {
  'my-project': {
    favicon: 'https://my-site.com/favicon.ico',
    title: 'My Project - Test Report'
  },
  // ...
};
```

4. **Seed in DB:**
```typescript
// Prisma script
await prisma.project.create({
  data: {
    name: 'my-project',
    url: 'https://my-site.com',
    description: 'Description',
  },
});
```

### Debugging

```bash
# View traces from failed test
npx playwright show-trace test-results/.../trace.zip

# Debug mode with inspector
npx playwright test --debug tests/pip/home/form.spec.ts

# Interactive UI mode
npx playwright test --ui

# View Prisma logs
DEBUG="prisma:*" npm run dev
```

## Contributing

1. Fork the repo
2. Branch from `master`: `git checkout -b feature/new-feature`
3. Descriptive commits following convention
4. Tests must pass: `npm run test`
5. Lint must pass: `npm run lint`
6. PR to `master` with detailed description

---
## ✍️ Author

- Created by **Carlos Garzón**
- Software Engineer, Fullstack Developer.
---

## Licenses

MIT
