# Microsoft Clarity Integration

This project integrates with the [Microsoft Clarity Data Export API](https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-data-export-api) to display comprehensive analytics data in a beautiful dashboard.

## 🎯 Features

The dashboard displays all available metrics from the Clarity API:

### Key Performance Indicators (KPIs)
- **Total Sessions** - Number of user sessions
- **Distinct Users** - Unique visitors
- **Avg. Engagement Time** - Average time users spend actively engaging
- **Avg. Scroll Depth** - How far users scroll on pages (percentage)
- **Rage Clicks** - Frustration indicators (rapid clicking)
- **Dead Clicks** - Clicks on non-interactive elements
- **Quick Backs** - Users who quickly navigate back
- **Excessive Scrolls** - Confused scrolling behavior
- **Script Errors** - JavaScript errors encountered
- **Error Clicks** - Clicks that triggered errors

### Dimensional Breakdowns
- **By Device** - Desktop, Mobile, Tablet distribution
- **By Browser** - Chrome, Firefox, Safari, etc.
- **By Operating System** - Windows, macOS, iOS, Android, etc.
- **By Country** - Geographic distribution
- **By Traffic Source** - Where users come from
- **By Channel** - Organic, Paid, Direct, etc.
- **Top Pages** - Most visited pages with titles
- **Top Referrers** - External sites referring traffic

## 🚀 Setup

### 1. Get Your Clarity API Credentials

1. Go to your [Microsoft Clarity](https://clarity.microsoft.com/) project
2. Navigate to **Settings** → **Data Export**
3. Click **"Generate new API token"**
4. Copy your **API Token** and **Project ID**

### 2. Configure Environment Variables

Add the following to your `.env` file:

```env
CLARITY_TOKEN=your_clarity_api_token_here
CLARITY_PROJECT_ID=your_project_id_here
```

### 3. Access the Dashboard

Visit: `http://localhost:3000/clarity-dashboard`

## 📊 How It Works

### Data Fetching Strategy

The integration makes **9 parallel API calls** to fetch different dimensions:

1. Base metrics (no dimension)
2. By Device
3. By Browser
4. By OS
5. By Country
6. By URL
7. By Referrer URL
8. By Source
9. By Channel

All calls are made in parallel for optimal performance while respecting the API's rate limit of **10 requests per day**.

### Caching

Data is cached locally in `data/clarityCache.json` to:
- Minimize API calls (you only have 10 per day)
- Provide faster load times
- Maintain historical data (last 30 days)

### Manual Refresh

Click the **"Refresh Data"** button in the dashboard to fetch fresh data from Clarity. This will:
- Make a new API call (counts against your daily limit)
- Update the cache
- Reload the dashboard with new data

## 🔧 API Endpoints

### GET `/api/clarity`
Returns cached Clarity data.

**Response:**
```json
[
  {
    "date": "2026-01-11",
    "totals": {
      "sessions": 1234,
      "distinctUsers": 987,
      "engagementTimeAvg": 45.6,
      "scrollDepthAvg": 67.8,
      // ... more metrics
    },
    "byDevice": { "Desktop": 800, "Mobile": 434 },
    "byBrowser": { "Chrome": 900, "Firefox": 334 },
    // ... more dimensions
  }
]
```

### POST `/api/clarity`
Fetches fresh data from Clarity API and updates cache.

**Response:**
```json
{
  "ok": true,
  "added": "2026-01-11"
}
```

Or if rate limit is reached:
```json
{
  "warning": "Clarity limit reached – devolviendo snapshot más reciente",
  "latest": { /* cached data */ }
}
```

## 📋 Rate Limits & Optimization Strategies

**Microsoft Clarity API Limits:**
- **10 API requests per day** per project
- Maximum **3 days** of historical data per request
- Up to **3 dimensions** per request
- Maximum **1,000 rows** per response (non-paginated)

### API Call Strategies

We've implemented 3 configurable strategies to optimize API usage:

#### 🟢 **MINIMAL** (Default - 2 calls per refresh)
Best for: Daily monitoring with tight API limits

**What you get:**
- ✅ All 10 KPIs (sessions, engagement, scroll depth, errors, etc.)
- ✅ Device breakdown (Desktop, Mobile, Tablet)
- ✅ Browser breakdown (Chrome, Firefox, Safari, etc.)
- ✅ OS breakdown (Windows, macOS, iOS, Android, etc.)
- ✅ Top 10 Pages with titles
- ✅ Top 10 Referrers
- ❌ Country/Source/Channel (not included)

**API calls made:**
1. Device + Browser + OS (combined with metrics)
2. URL + ReferrerURL (for pages and referrers)

**Total: 2 calls** → Can refresh **5 times per day**

#### 🟡 **BALANCED** (3 calls per refresh)
Best for: More insights while conserving API calls

**What you get:**
- ✅ Everything in MINIMAL
- ✅ Country breakdown
- ✅ Traffic Source breakdown
- ✅ Channel breakdown

**API calls made:**
1. Device + Browser + OS (combined with metrics)
2. URL (for pages)
3. Country + Source + Channel (for traffic sources)

**Total: 3 calls** → Can refresh **3 times per day**

#### 🔴 **FULL** (5 calls per refresh)
Best for: Maximum detail and separate dimension analysis

**What you get:**
- ✅ Everything in BALANCED
- ✅ More accurate cross-dimensional data
- ✅ Separate metric extraction per dimension

**API calls made:**
1. Base metrics (no dimension)
2. Device + Browser + OS
3. Country + Source + Channel
4. URL (pages)
5. ReferrerURL (referrers)

**Total: 5 calls** → Can refresh **2 times per day**

### Configuring Your Strategy

Set in your `.env` file:

```env
# Choose: minimal | balanced | full
CLARITY_API_STRATEGY=minimal
```

### Smart Caching

Regardless of strategy, all data is cached locally:
- **Cache file:** `data/clarityCache.json`
- **History:** Last 30 days
- **Persistence:** Survives server restarts
- **Fallback:** Returns cached data if API limit is reached

### Recommended Usage

| Use Case | Strategy | Refreshes/Day | Best For |
|----------|----------|---------------|----------|
| Daily check-in | `minimal` | 5x | Quick KPI monitoring |
| Weekly analysis | `balanced` | 3x | Traffic source insights |
| Deep-dive reports | `full` | 2x | Comprehensive analysis |

**Pro tip:** Use `minimal` for daily monitoring, then switch to `full` when you need detailed reports.

## 🎨 Components

### Dashboard Components
- `ClarityKPIs` - Main KPI cards
- `ClarityDevicesChart` - Pie chart for device distribution
- `ClarityBrowserChart` - Pie chart for browser distribution
- `ClarityOSChart` - Bar chart for OS distribution
- `ClarityCountriesChart` - Horizontal bar chart for top countries
- `ClarityTopPages` - Table of most visited pages
- `ClarityTrafficSources` - Traffic sources and channels
- `ClarityReferrers` - Top referring websites

### Custom Hook
- `useClarity()` - React hook for accessing Clarity data with SWR

## 📚 Available Metrics from Clarity API

All metrics available in the Data Export API are included:

- Scroll Depth
- Engagement Time
- Traffic
- Popular Pages
- Browser
- Device
- OS
- Country/Region
- Page Title
- Referrer URL
- Dead Click Count
- Excessive Scroll
- Rage Click Count
- Quickback Click
- Script Error Count
- Error Click Count

## 🔗 Resources

- [Clarity Data Export API Documentation](https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-data-export-api)
- [Microsoft Clarity Dashboard](https://clarity.microsoft.com/)
- [Clarity Client API](https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-api)

## 💡 Tips & Best Practices

### Preserving API Calls

1. **Start with `minimal` strategy** - Gets you 80% of insights with only 2 calls
2. **Check cached data first** - The cache provides historical trends without API calls
3. **Schedule strategic refreshes** - Refresh once in morning, once in afternoon (minimal = 5 refreshes possible)
4. **Use `full` mode sparingly** - Only when you need comprehensive reports

### Changing Strategies

You can change strategies anytime:

```bash
# Edit .env
CLARITY_API_STRATEGY=balanced

# Restart server
npm run dev

# Refresh data with new strategy
# Visit /clarity-dashboard and click "Refresh Data"
```

### Daily Refresh Examples

**Minimal strategy (2 calls/refresh):**
- 9:00 AM - Morning check-in
- 12:00 PM - Midday update
- 3:00 PM - Afternoon review
- 5:00 PM - End-of-day summary
- 8:00 PM - Evening check
**Total: 10 calls used** ✅

**Balanced strategy (3 calls/refresh):**
- 9:00 AM - Morning check-in
- 2:00 PM - Afternoon review
- 6:00 PM - End-of-day summary
**Total: 9 calls used** ✅

**Full strategy (5 calls/refresh):**
- 10:00 AM - Comprehensive morning report
- 4:00 PM - Comprehensive afternoon report
**Total: 10 calls used** ✅

### Combining Strategies

Smart teams alternate strategies:
- **Monday-Friday:** Use `minimal` for daily monitoring
- **Monday morning:** Switch to `full` for weekly comprehensive report
- **Emergency:** Always keep 2-3 calls reserved for urgent checks

### Integration with Other Tools

4. **Combine with Clarity dashboard** - Use this for programmatic access, Clarity's UI for detailed session recordings
5. **Export data** - Cache file can be backed up, analyzed in Excel, or fed to other tools
6. **Automated reports** - Set up cron jobs to refresh and generate reports

## ⚠️ Error Handling

Common errors and solutions:

- **401 Unauthorized**: Invalid or expired API token
- **403 Forbidden**: Token lacks proper authorization
- **400 BadRequest**: Invalid parameters (check project ID)
- **429 TooManyRequests**: Exceeded daily rate limit (wait 24 hours)

The system gracefully handles API errors by returning cached data when available.

---

## 🔧 Troubleshooting Guide - ACTUALIZADO

### Problema Identificado: Dashboard No Muestra Métricas

#### 🔍 Causa Raíz
El archivo `data/clarityCache.json` **no existía**. Solo estaba presente el archivo backup, causando que la API no pudiera leer los datos.

#### ✅ Soluciones Implementadas

##### 1. **Archivo Cache Restaurado**
Se creó `data/clarityCache.json` con estructura válida inicial.

##### 2. **API Route Mejorada** (`src/app/api/clarity/route.ts`)
- ✅ Validación robusta de datos
- ✅ Backups automáticos antes de escribir
- ✅ Mejor manejo de errores con logs detallados
- ✅ Retorna snapshot vacío si cache está vacío
- ✅ Status codes apropiados (429 para rate limit)

##### 3. **Hook useClarity Mejorado**
- ✅ Fetcher con validación de datos
- ✅ Configuración SWR optimizada (cache 5 min, 3 reintentos)
- ✅ No revalida en focus (ahorra API calls)
- ✅ Función `mutate` para refresh manual

##### 4. **Componente ClarityKPIs Mejorado**
Estados ahora manejados:
- **Loading:** Spinner animado
- **Error:** Mensaje con checklist de troubleshooting
- **No Data:** Instrucción clara para refrescar
- **Success:** Muestra métricas normalmente

##### 5. **Script de Restauración Automática**

Nuevo script: `scripts/restore-clarity-cache.js`

```bash
node scripts/restore-clarity-cache.js
```

**Funcionalidades:**
- Detecta backups existentes
- Restaura el más reciente automáticamente
- Crea cache vacío si no hay backups
- Valida estructura de datos

### 🚀 Pasos para Resolver

#### Método 1: Restaurar desde Backup
```bash
# Ejecutar script de restauración
node scripts/restore-clarity-cache.js

# Reiniciar servidor
npm run dev

# Visitar dashboard
open http://localhost:3000/clarity-dashboard
```

#### Método 2: Fetch Nuevos Datos
```bash
# Verificar env variables
cat .env | grep CLARITY

# Iniciar servidor
npm run dev

# Ir al dashboard y hacer click en "Refresh Data"
# Esto hará una llamada a la API y creará el cache
```

### 📝 Verificaciones

#### 1. **Verificar Cache File**
```bash
# Debe existir
ls -la data/clarityCache.json

# Ver contenido
cat data/clarityCache.json | jq '.'
```

#### 2. **Verificar Variables de Entorno**
```bash
# .env debe tener:
CLARITY_TOKEN=your_token_here
CLARITY_PROJECT_ID=your_project_id_here
CLARITY_API_STRATEGY=minimal
```

#### 3. **Probar API Directamente**
```bash
# GET - Ver cache
curl http://localhost:3000/api/clarity | jq '.'

# POST - Refrescar datos (consume 1 API call)
curl -X POST http://localhost:3000/api/clarity | jq '.'
```

### 🎯 Prevención Futura

#### Backups Automáticos
El sistema ahora crea backups automáticamente:
```
data/
├── clarityCache.json                      # Actual
├── clarityCache.backup-1768186460540.json # Backup 1
├── clarityCache.backup-1768186461234.json # Backup 2
└── ...
```

#### Logs Detallados
El sistema ahora muestra logs en consola:
```
Fetching data from Clarity API...
Clarity data received: {...}
Current cache has 5 snapshots
Backup created: data/clarityCache.backup-1768186460540.json
Snapshot for 2025-01-12 added successfully
```

### 📊 Monitoreo

#### Ver Estado del Sistema
1. **Dashboard:**
   - Verde = Todo OK
   - Amarillo = Sin datos (click "Refresh Data")
   - Rojo = Error (revisar env variables)

2. **Console Logs:**
   - Abrir DevTools → Console
   - Buscar mensajes de "Clarity"

3. **Network Tab:**
   - Ver llamadas a `/api/clarity`
   - Status 200 = OK
   - Status 429 = Rate limit alcanzado
   - Status 500 = Error interno

### 🔗 Archivos Actualizados

```
✅ src/app/api/clarity/route.ts         - API robusta con logs
✅ src/hooks/useClarity.ts               - Validación y cache
✅ src/components/dashboard/ClarityKPIs.tsx - Mejor UX
✅ data/clarityCache.json                - Restaurado
✅ scripts/restore-clarity-cache.js      - Script nuevo
✅ CLARITY_INTEGRATION.md                - Documentación actualizada
```

---

**Última actualización:** 2025-01-12
**Estado:** ✅ Resuelto y mejorado con mejoras de resiliencia
