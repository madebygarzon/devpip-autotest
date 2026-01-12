# Clarity Database Migration Guide

## 🎯 Overview

The Clarity integration has been migrated from **JSON file storage** to **PostgreSQL database** using Prisma ORM.

### Benefits of Database Storage

| Feature | JSON File | PostgreSQL Database |
|---------|-----------|---------------------|
| **Performance** | File I/O | Optimized queries with indexes |
| **Reliability** | Manual backups | ACID transactions |
| **Scalability** | Limited | Unlimited snapshots |
| **Querying** | Load all → filter | SQL queries with indexes |
| **Concurrency** | File locks | Database transactions |
| **Data Integrity** | Manual validation | Foreign keys & constraints |
| **Always Available** | ❌ Requires file | ✅ Always in database |
| **API Quota Saving** | ❌ No check | ✅ Smart deduplication |

## 📊 Database Schema

### Main Model: `ClaritySnapshot`

Stores daily analytics snapshots with 8 related dimension tables.

**Totals (10 metrics):**
- sessions, distinctUsers
- engagementTimeAvg, scrollDepthAvg
- rageClicks, deadClicks, quickBackClicks
- excessiveScrolls, scriptErrors, errorClicks

**Relations (8 dimension tables):**
1. devices (Desktop, Mobile, Tablet)
2. browsers (Chrome, Firefox, Safari, etc.)
3. operatingSystems (Windows, macOS, iOS, Android)
4. countries (US, CO, MX, etc.)
5. sources (Direct, Google, Facebook, etc.)
6. channels (Organic, Paid, Direct, Referral)
7. pages (Top 10 pages with titles)
8. referrers (Top 10 referring websites)

### Key Features

- ✅ Foreign keys with `ON DELETE CASCADE`
- ✅ Indexes on date, sessions, snapshotId
- ✅ Unique constraints (date, snapshotId + dimension)
- ✅ Optimized for read-heavy workload

## 🚀 Quick Start

### 1. Generate Prisma Client

```bash
npx prisma generate
```

### 2. Run Migration

```bash
npx prisma migrate dev --name add-clarity-tables
```

### 3. Migrate Existing Data

```bash
npx tsx scripts/migrate-clarity-to-db.ts
```

### 4. Verify Migration

```bash
# View in Prisma Studio
npx prisma studio

# Or query via API
curl http://localhost:3000/api/clarity
```

## 💡 Smart API Usage

### Before (JSON File)

```
User clicks "Refresh" → Always calls Clarity API → Uses API quota
User clicks again → Calls API again → Wastes quota!
```

### After (Database)

```typescript
User clicks "Refresh"
  ↓
Check: hasSnapshotForToday()?
  ↓
YES → Return from DB (no API call) ✅
  ↓
NO → Call Clarity API → Save to DB → Return data
```

**Result:** Multiple refreshes in same day = 0 additional API calls!

## 📋 Migration Script

### What It Does

```bash
npx tsx scripts/migrate-clarity-to-db.ts
```

1. Reads `data/clarityCache.json`
2. Connects to PostgreSQL
3. For each snapshot:
   - Check if already exists (skip duplicates)
   - Save main snapshot
   - Save all dimension data
4. Show summary & verify

### Expected Output

```
🔄 Starting Clarity data migration...

📁 Reading cache file
✅ Found 15 snapshot(s)

[1/15] Processing snapshot for date: 2025-01-01
   ✅ Saved successfully
[2/15] Processing snapshot for date: 2025-01-02
   ✅ Saved successfully
...

============================================================
📊 Migration Summary:
============================================================
✅ Successfully migrated: 15
⏭️  Skipped (already exist): 0
❌ Errors: 0
============================================================

✅ Database now contains 15 snapshot(s)

✨ Migration completed!
```

## 📝 Files Changed

### Created

```
✅ src/lib/clarityDb.ts                  - Database service layer
✅ scripts/migrate-clarity-to-db.ts      - Migration script
✅ DATABASE_MIGRATION.md                 - This file
```

### Modified

```
✅ prisma/schema.prisma                  - Added Clarity models
✅ src/app/api/clarity/route.ts          - Uses PostgreSQL now
✅ src/app/clarity-dashboard/page.tsx    - Better UX messages
```

### Legacy (can be deleted after migration)

```
⚠️  data/clarityCache.json
⚠️  data/clarityCache.backup-*.json
```

## 🎨 User Experience

### Messages

**Already fetched today:**
```
✅ Ya existe un snapshot para hoy.
No se consumió ninguna llamada API adicional.
```

**Fresh data:**
```
✅ Datos actualizados desde la API de Clarity.
Nuevo snapshot guardado en la base de datos.
```

**Rate limit reached:**
```
⚠️ LÍMITE DIARIO ALCANZADO

Has alcanzado el límite de 10 llamadas API por día.
📊 Mostrando datos guardados en la base de datos.
💡 Los datos se refrescarán automáticamente mañana.
```

## 🔧 Database Service API

### Save Snapshot

```typescript
import { saveClaritySnapshot } from "@/lib/clarityDb";

const snapshot = await getClarityData();
await saveClaritySnapshot(snapshot);
```

### Get Snapshots

```typescript
import { getClaritySnapshots } from "@/lib/clarityDb";

const last30Days = await getClaritySnapshots(30);
const latest = last30Days[0];
```

### Check Today

```typescript
import { hasSnapshotForToday } from "@/lib/clarityDb";

if (await hasSnapshotForToday()) {
  console.log("Already fetched - skip API call!");
}
```

### Cleanup Old Data

```typescript
import { cleanupOldSnapshots } from "@/lib/clarityDb";

const deleted = await cleanupOldSnapshots(30);
console.log(`Deleted ${deleted} old snapshots`);
```

## 🐛 Troubleshooting

### Migration Failed

```bash
# Reset and retry
npx prisma migrate reset
npx prisma migrate dev
npx tsx scripts/migrate-clarity-to-db.ts
```

### No Data in Dashboard

1. Verify migration:
   ```bash
   npx prisma studio
   ```

2. Check API:
   ```bash
   curl http://localhost:3000/api/clarity
   ```

3. View logs in terminal

### Prisma Client Errors

```bash
npx prisma generate
npm run dev
```

## ✅ Post-Migration Checklist

- [ ] Database migration completed
- [ ] Data migrated successfully
- [ ] Dashboard shows data correctly
- [ ] "Refresh Data" button works
- [ ] Smart API deduplication works
- [ ] Error messages are user-friendly
- [ ] JSON backup files saved
- [ ] Database backups configured

---

**Status:** ✅ Complete
**Date:** 2025-01-12
**Database:** PostgreSQL + Prisma
**Backward Compatible:** Yes
