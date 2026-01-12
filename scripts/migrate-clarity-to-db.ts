#!/usr/bin/env ts-node

/**
 * Migration script: Clarity JSON Cache → PostgreSQL Database
 *
 * This script migrates existing Clarity snapshots from the JSON file
 * to the PostgreSQL database using Prisma.
 *
 * Usage:
 *   npx tsx scripts/migrate-clarity-to-db.ts
 */

import "dotenv/config";
import { promises as fs } from "node:fs";
import path from "node:path";
import { prisma } from "../src/lib/prisma";
import { saveClaritySnapshot } from "../src/lib/clarityDb";
import type { ClaritySnapshot } from "../src/lib/clarity";

const CACHE_FILE = path.resolve(process.cwd(), "data/clarityCache.json");

async function migrateClarityToDatabase() {
  console.log("🔄 Starting Clarity data migration from JSON to PostgreSQL...\n");

  try {
    // Read JSON cache file
    console.log(`📁 Reading cache file: ${CACHE_FILE}`);

    let snapshots: ClaritySnapshot[] = [];

    try {
      const raw = await fs.readFile(CACHE_FILE, "utf8");
      snapshots = JSON.parse(raw);

      if (!Array.isArray(snapshots)) {
        console.error("❌ Cache file is not an array");
        process.exit(1);
      }

      console.log(`✅ Found ${snapshots.length} snapshot(s) in JSON file\n`);
    } catch (error: any) {
      if (error.code === "ENOENT") {
        console.log("⚠️  No cache file found. Nothing to migrate.");
        console.log("   Database is empty and ready for new data.\n");
        return;
      }
      throw error;
    }

    if (snapshots.length === 0) {
      console.log("ℹ️  Cache file is empty. Nothing to migrate.\n");
      return;
    }

    // Check database connection
    console.log("🔌 Testing database connection...");
    await prisma.$connect();
    console.log("✅ Database connected\n");

    // Migrate each snapshot
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (let i = 0; i < snapshots.length; i++) {
      const snapshot = snapshots[i];
      console.log(`[${i + 1}/${snapshots.length}] Processing snapshot for date: ${snapshot.date}`);

      try {
        // Check if already exists
        const existing = await prisma.claritySnapshot.findUnique({
          where: { date: new Date(snapshot.date) },
          select: { id: true }
        });

        if (existing) {
          console.log(`   ⏭️  Skipped (already exists in database)`);
          skipCount++;
          continue;
        }

        // Save to database
        await saveClaritySnapshot(snapshot);
        console.log(`   ✅ Saved successfully`);
        successCount++;

      } catch (error: any) {
        console.error(`   ❌ Error: ${error.message}`);
        errorCount++;
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("📊 Migration Summary:");
    console.log("=".repeat(60));
    console.log(`✅ Successfully migrated: ${successCount}`);
    console.log(`⏭️  Skipped (already exist): ${skipCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📦 Total snapshots processed: ${snapshots.length}`);
    console.log("=".repeat(60) + "\n");

    // Verify migration
    console.log("🔍 Verifying migration...");
    const dbCount = await prisma.claritySnapshot.count();
    console.log(`✅ Database now contains ${dbCount} snapshot(s)\n`);

    if (successCount > 0) {
      console.log("💡 Migration successful! You can now:");
      console.log("   1. Visit http://localhost:3000/clarity-dashboard");
      console.log("   2. The dashboard will now load data from PostgreSQL");
      console.log("   3. You can safely keep or delete data/clarityCache.json\n");
    }

  } catch (error: any) {
    console.error("\n❌ Migration failed:", error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log("👋 Database connection closed");
  }
}

// Run migration
migrateClarityToDatabase()
  .then(() => {
    console.log("\n✨ Migration completed!\n");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Unexpected error:", error);
    process.exit(1);
  });
