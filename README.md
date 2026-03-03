# DevPiP AutoTest Suite

Plataforma de testing automatizado E2E con dashboard web moderno para ejecutar, monitorear y analizar tests de Playwright en múltiples proyectos.

## Stack Tecnológico

### Frontend & Framework
- **Next.js 15.4.2** - React framework con App Router y Turbopack
- **React 19.1.0** - Biblioteca UI con RSC (React Server Components)
- **TypeScript 5** - Tipado estático
- **Tailwind CSS 4** - Framework CSS utilitario con PostCSS
- **Radix UI** - Componentes accesibles headless:
  - Dialog, Dropdown Menu, Select, Tabs, Tooltip
  - Collapsible, Label, Separator, Slot
- **Lucide React** - Sistema de iconos
- **class-variance-authority** + **clsx** + **tailwind-merge** - Gestión de clases
- **Recharts 3.1** - Visualización de datos y gráficos

### Testing
- **Playwright 1.54** - Framework E2E testing
  - Configuración multi-proyecto (pip, gradepotential, itopia, metricmarine)
  - Screenshots y videos en fallos (`only-on-failure`)
  - Traces para debugging (`retain-on-failure`)
  - Reportes HTML interactivos
  - Headless mode por defecto

### Base de Datos & ORM
- **PostgreSQL** - Base de datos relacional
- **Prisma 7.2.0** - ORM TypeScript-first
  - `@prisma/client` - Cliente generado
  - `@prisma/extension-accelerate` - Connection pooling y caching
  - Schema con modelos para:
    - Proyectos y ejecuciones de tests
    - Media (screenshots, videos)
    - Errores de tests
    - Microsoft Clarity analytics

### State Management & Data Fetching
- **SWR 2.3** - React Hooks para fetching y caching de datos
  - Revalidación automática
  - Caché optimista
  - Real-time updates

### Integraciones Externas
- **Microsoft Clarity API** - Analytics y session replay
  - Métricas de engagement
  - Device/Browser/OS breakdown
  - Geolocalización
  - Traffic sources
- **DeepSeek AI** - Chat asistente para análisis de errores
- **HubSpot** - Validación de formularios

### Utilidades
- **Cheerio 1.1** - jQuery para Node.js (parsing HTML)
- **Fuse.js 7.0** - Búsqueda fuzzy
- **PapaParse 5.5** - Parser CSV
- **SweetAlert2 11.22** - Modales y alertas elegantes
- **dotenv 17.2** - Variables de entorno

### Dev Dependencies
- **ESLint 9** + **eslint-config-next**
- **tsx 4.21** - TypeScript executor para scripts
- **tw-animate-css** - Animaciones Tailwind

## Arquitectura del Sistema

```
devpip-autotest/
├── src/
│   ├── app/                           # Next.js App Router
│   │   ├── api/                       # API Routes
│   │   │   ├── run-test/route.ts      # POST: Ejecuta tests vía spawn
│   │   │   ├── download-report/route.ts # GET: Descarga ZIP de reportes
│   │   │   ├── deepseek/route.ts      # POST: Chat AI
│   │   │   └── clarity/               # Clarity API endpoints
│   │   │       ├── metrics/route.ts
│   │   │       ├── devices/route.ts
│   │   │       ├── countries/route.ts
│   │   │       └── sources/route.ts
│   │   ├── page.tsx                   # Dashboard principal (Client Component)
│   │   ├── layout.tsx                 # Root layout
│   │   └── globals.css                # Estilos globales Tailwind
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
│   │   ├── TestHistory.tsx            # Historial con filtros y búsqueda
│   │   ├── ClarityDashboardContent.tsx
│   │   └── AIChat.tsx                 # Chat DeepSeek
│   ├── lib/
│   │   └── db.ts                      # Prisma client + queries helpers
│   └── generated/
│       └── prisma/                    # Cliente Prisma generado
├── tests/                             # Tests Playwright organizados por proyecto
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
│   └── migrations/                    # Migrations SQL
├── public/
│   └── reports/                       # Reportes HTML servidos estáticamente
│       ├── pip/
│       ├── gradepotential/
│       ├── itopia/
│       └── metricmarine/
├── playwright-report/                 # Reporte local generado
├── test-results/                      # Screenshots/videos de fallos
├── playwright.config.ts               # Configuración Playwright
├── tailwind.config.ts                 # Configuración Tailwind
└── tsconfig.json                      # TypeScript config
```

## Características Principales

### 1. Test Runner con Streaming
- Ejecución de tests individuales o suites completas
- Streaming en tiempo real del output vía `ReadableStream`
- Spawn de proceso Node (`npx playwright test`)
- Parsing de output con detección de ANSI codes
- Explicaciones amigables post-test automáticas
- Generación de reportes HTML con favicon customizado

**Flow:**
```
Cliente → POST /api/run-test → spawn playwright → stream output →
copy report → extract media → save to DB → response close
```

### 2. Persistencia de Historial
- Todos los test runs se guardan en PostgreSQL
- Relaciones Prisma:
  ```prisma
  Project 1—n TestRun 1—n (TestMedia | TestError)
  ```
- Queries optimizadas con indexes en `projectId`, `createdAt`, `testPath`
- Legacy ID support para compatibilidad con sistema anterior
- Cascade delete para limpieza automática

### 3. Dashboard de Clarity Analytics
- Snapshots diarios de métricas agregadas
- Breakdown dimensional:
  - Dispositivos (Desktop, Mobile, Tablet)
  - Navegadores (Chrome, Firefox, Safari, etc.)
  - Operating Systems (Windows, macOS, iOS, Android)
  - Países (códigos ISO)
  - Traffic sources y channels
  - Top páginas y referrers
- Métricas de UX:
  - Rage clicks, dead clicks, quick backs
  - Scroll depth, engagement time
  - Script errors, error clicks
- Estrategias de API configurables: `minimal`, `balanced`, `full`

### 4. Chat AI Contextual
- Integración con DeepSeek API
- Contexto automático de errores de tests
- Modal flotante con animaciones
- Markdown rendering
- Auto-truncate de prompts largos (4000 chars)

## Configuración

### Requisitos
- Node.js 20+
- PostgreSQL 14+
- npm/pnpm/yarn

### Variables de Entorno

```bash
# .env
DEEPSEEK_API_KEY=your_api_key

# Database - Direct connection
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"

# Prisma Accelerate (opcional, para mejor performance)
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

### Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Generar Prisma Client
npx prisma generate

# 3. Ejecutar migraciones
npx prisma migrate dev --name init

# 4. (Opcional) Seed inicial
npx tsx scripts/seed.ts

# 5. Instalar navegadores de Playwright
npx playwright install
```

### Scripts

```bash
npm run dev        # Next.js dev con Turbopack (puerto 3000)
npm run build      # Build producción
npm run start      # Servidor producción
npm run lint       # ESLint
npm run test       # Ejecutar tests Playwright
```

## Uso

### 1. Ejecutar Tests desde UI

```
http://localhost:3000
```

1. Selecciona proyecto (pip, gradepotential, itopia, metricmarine)
2. Opcionalmente especifica test path (ej: `tests/pip/home/form.spec.ts`)
3. Click "Run Tests"
4. Visualiza output en tiempo real
5. Click "View Report" para ver HTML detallado

### 2. Ejecutar Tests desde CLI

```bash
# Todos los tests de un proyecto
npx playwright test --project pip

# Test específico
npx playwright test tests/pip/home/form.spec.ts --project pip

# Con headed mode (ver navegador)
npx playwright test --headed --project pip

# Debug mode con inspector
npx playwright test --debug tests/pip/home/form.spec.ts

# UI mode interactivo
npx playwright test --ui
```

### 3. Acceso a Reportes

- **Local:** `playwright-report/index.html`
- **Web:** `http://localhost:3000/reports/{proyecto}/index.html`
- **Descarga:** API endpoint `/api/download-report?testRunId=xxx`

### 4. Dashboard de Clarity

Navega a la sección "Clarity Dashboard" para ver:
- Métricas agregadas (sesiones, usuarios, engagement)
- Gráficos de dispositivos y navegadores
- Mapa de países
- Fuentes de tráfico
- Top páginas

## Flujo de Ejecución

### Test Run Flow

```mermaid
sequenceDiagram
    participant U as Usuario
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
    participant U as Usuario
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

Ejecuta tests de Playwright con streaming en tiempo real.

**Request:**
```json
{
  "testPath": "tests/pip/home/form.spec.ts",  // Opcional: "" = todos los tests
  "project": "pip"                            // Requerido
}
```

**Response:** `text/plain; charset=utf-8` con streaming

**Proceso:**
1. Spawn `npx playwright test {args}`
2. Stream stdout/stderr con ANSI strip
3. Generar reporte HTML
4. Copiar a `public/reports/{project}/`
5. Customizar title y favicon
6. Extraer media (screenshots, videos) a `assets/`
7. Parse resultados (passed, failed, errors)
8. Guardar en DB
9. Close stream

### `GET /api/download-report?testRunId={id}`

Descarga reporte como ZIP.

### `POST /api/deepseek`

Chat AI.

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

Métricas agregadas de Clarity.

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

Breakdown por dispositivo.

**Response:**
```json
[
  { "deviceType": "Desktop", "sessions": 800 },
  { "deviceType": "Mobile", "sessions": 400 },
  { "deviceType": "Tablet", "sessions": 34 }
]
```

## Modelo de Datos

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

// ... similar para Browser, OS, Country, Source, Channel, Page, Referrer
```

## Estructura de Tests

Los tests siguen el patrón **AAA** (Arrange, Act, Assert):

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

### Categorías de Tests

```
tests/
├── pip/
│   ├── home/
│   │   ├── form.spec.ts                    # Formulario contacto
│   │   ├── form-validation.spec.ts          # Validaciones
│   │   ├── form-validation-hubspot.spec.ts  # Integración HubSpot
│   │   ├── hero-section.spec.ts             # Hero y CTAs
│   │   ├── carousel-animation.spec.ts       # Animaciones
│   │   ├── menu-links.spec.ts               # Navegación
│   │   ├── menu-links-footer.spec.ts        # Footer
│   │   ├── mobile-menu.spec.ts              # Menú móvil
│   │   ├── home-cards-navigation.spec.ts    # Tarjetas
│   │   ├── home-anchor.spec.ts              # Anclas
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
- **SWR** para caching agresivo de test history y Clarity data
- **Next.js Image** para optimización de imágenes
- **Turbopack** para dev builds ultra-rápidos
- **React Server Components** para reducir bundle size
- **Code splitting** automático por Next.js

### Database
- **Prisma Accelerate** para connection pooling global
- **Indexes** estratégicos en queries frecuentes
- **Cascade delete** para evitar orphaned records
- **Unique constraints** para prevenir duplicados

### Playwright
- **Headless mode** por defecto
- **Screenshot/video** solo en fallos
- **Trace** solo en fallos
- **Parallel execution** (configurable en `playwright.config.ts`)

## Producción

### Build & Deploy

```bash
# Build Next.js
npm run build

# Variables de entorno requeridas en producción
DATABASE_URL
PRISMA_DATABASE_URL  # Recomendado para Accelerate
DEEPSEEK_API_KEY
CLARITY_PROJECT_ID
CLARITY_TOKEN
CLARITY_API_STRATEGY

# Start servidor
npm run start
```

### Considerations

- **Auth:** Agregar middleware de autenticación en production
- **HTTPS:** Proxy reverso (nginx, Cloudflare)
- **CORS:** Configurar para tu dominio
- **Rate Limiting:** API routes de Clarity y DeepSeek
- **Database:** Conexión SSL requerida, connection pooling
- **Monitoring:** Logs de errores, APM (Sentry, Datadog)
- **Backups:** PostgreSQL automático

## Desarrollo

### Agregar Nuevo Proyecto

1. **Configurar Playwright:**
```typescript
// playwright.config.ts
projects: [
  {
    name: 'mi-proyecto',
    use: { baseURL: 'https://mi-sitio.com' },
  },
]
```

2. **Crear tests:**
```bash
mkdir tests/mi-proyecto
mkdir tests/mi-proyecto/home
touch tests/mi-proyecto/home/form.spec.ts
```

3. **Agregar a UI:**
```typescript
// src/app/api/run-test/route.ts
const PROJECT_CONFIGS: Record<string, { favicon: string; title: string }> = {
  'mi-proyecto': {
    favicon: 'https://mi-sitio.com/favicon.ico',
    title: 'Mi Proyecto - Test Report'
  },
  // ...
};
```

4. **Seed en DB:**
```typescript
// Script Prisma
await prisma.project.create({
  data: {
    name: 'mi-proyecto',
    url: 'https://mi-sitio.com',
    description: 'Descripción',
  },
});
```

### Debugging

```bash
# Ver traces de test fallido
npx playwright show-trace test-results/.../trace.zip

# Modo debug con inspector
npx playwright test --debug tests/pip/home/form.spec.ts

# Modo UI interactivo
npx playwright test --ui

# Ver logs Prisma
DEBUG="prisma:*" npm run dev
```

## Contribuciones

1. Fork del repo
2. Branch desde `master`: `git checkout -b feature/nueva-funcionalidad`
3. Commits descriptivos siguiendo convención
4. Tests pasen: `npm run test`
5. Lint pase: `npm run lint`
6. PR a `master` con descripción detallada

## Licencia

Proyecto privado - Dev Team PIP

## Contacto

Dev Team PIP

---

**v2.0.0** • All systems operational
