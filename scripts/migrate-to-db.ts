#!/usr/bin/env tsx
/**
 * Migration script to transfer test history from JSON file to database
 *
 * Usage: npx tsx scripts/migrate-to-db.ts
 */

import "dotenv/config";
import { promises as fs } from "fs";
import path from "path";
import { createTestRun } from "../src/lib/db";

interface OldTestRun {
  id: number;
  date: string;
  testPath: string;
  project: string;
  passed: number;
  failed: number;
  screenshots: string[];
  videos: string[];
  errors: string[];
}

async function migrateData() {
  console.log("🚀 Starting migration from JSON to database...\n");

  const historyFile = path.join(process.cwd(), "data", "testHistory.json");

  try {
    // Read the JSON file
    const data = await fs.readFile(historyFile, "utf-8");
    const testRuns: OldTestRun[] = JSON.parse(data);

    console.log(`📊 Found ${testRuns.length} test runs to migrate\n`);

    let successCount = 0;
    let errorCount = 0;

    // Migrate each test run
    for (const run of testRuns) {
      try {
        await createTestRun({
          testPath: run.testPath,
          project: run.project,
          passed: run.passed,
          failed: run.failed,
          screenshots: run.screenshots,
          videos: run.videos,
          errors: run.errors,
          legacyId: run.id,
        });

        successCount++;
        console.log(`✅ Migrated test run ${run.id} (${run.project} - ${run.testPath})`);
      } catch (error) {
        errorCount++;
        console.error(`❌ Failed to migrate test run ${run.id}:`, error);
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log(`✅ Migration completed!`);
    console.log(`   Successfully migrated: ${successCount}`);
    console.log(`   Failed: ${errorCount}`);
    console.log("=".repeat(60) + "\n");

    // Create a backup of the original file
    const backupFile = historyFile.replace(".json", `.backup-${Date.now()}.json`);
    await fs.copyFile(historyFile, backupFile);
    console.log(`💾 Backup created at: ${backupFile}\n`);

  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

// Run the migration
migrateData()
  .then(() => {
    console.log("🎉 Migration script finished successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Migration script failed:", error);
    process.exit(1);
  });
