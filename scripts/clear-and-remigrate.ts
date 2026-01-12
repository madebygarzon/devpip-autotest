#!/usr/bin/env ts-node

/**
 * Clear database and re-migrate with real data
 */

import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { saveClaritySnapshot } from "../src/lib/clarityDb";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { ClaritySnapshot } from "../src/lib/clarity";

const CACHE_FILE = path.resolve(process.cwd(), "data/clarityCache.json");

async function clearAndRemigrate() {
  console.log("🔄 Clearing database and re-migrating with real data...\n");

  try {
    // Step 1: Clear existing snapshots
    console.log("🗑️  Deleting old snapshots...");
    const deleted = await prisma.claritySnapshot.deleteMany({});
    console.log(`   ✅ Deleted ${deleted.count} snapshot(s)\n`);

    // Step 2: Read updated cache file with real data
    console.log("📁 Reading cache file with real data...");
    const raw = await fs.readFile(CACHE_FILE, "utf8");
    const snapshots: ClaritySnapshot[] = JSON.parse(raw);
    console.log(`   ✅ Found ${snapshots.length} snapshot(s)\n`);

    // Step 3: Migrate real data
    console.log("💾 Migrating real data to database...");
    for (const snapshot of snapshots) {
      console.log(`   Processing snapshot for ${snapshot.date}...`);
      await saveClaritySnapshot(snapshot);
      console.log(`   ✅ Saved with ${snapshot.totals.sessions} sessions`);
    }

    console.log("\n✅ Migration completed successfully!");
    console.log("   You can now view the dashboard with real metrics\n");

  } catch (error: any) {
    console.error("❌ Error:", error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

clearAndRemigrate()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("💥 Unexpected error:", error);
    process.exit(1);
  });
