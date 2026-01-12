#!/usr/bin/env node

/**
 * Script to restore Clarity cache from backup
 * Usage: node scripts/restore-clarity-cache.js
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(process.cwd(), 'data');
const CACHE_FILE = path.join(DATA_DIR, 'clarityCache.json');

async function restoreClarityCache() {
  console.log('🔍 Checking for Clarity cache backups...\n');

  try {
    // Check if cache file exists
    if (fs.existsSync(CACHE_FILE)) {
      console.log('✅ Cache file already exists at:', CACHE_FILE);
      const cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
      console.log(`   Contains ${cache.length} snapshot(s)`);
      console.log('\n❓ Do you want to restore from backup anyway? (y/N)');
      return;
    }

    // Find backup files
    const files = fs.readdirSync(DATA_DIR);
    const backupFiles = files
      .filter(f => f.startsWith('clarityCache.backup-') && f.endsWith('.json'))
      .sort()
      .reverse(); // Most recent first

    if (backupFiles.length === 0) {
      console.log('⚠️  No backup files found in data/ directory');
      console.log('   Creating empty cache file...\n');

      const emptyCache = [{
        date: new Date().toISOString().slice(0, 10),
        totals: {
          sessions: 0,
          distinctUsers: 0,
          engagementTimeAvg: 0,
          scrollDepthAvg: 0,
          rageClicks: 0,
          deadClicks: 0,
          quickBackClicks: 0,
          excessiveScrolls: 0,
          scriptErrors: 0,
          errorClicks: 0
        },
        byDevice: {},
        byBrowser: {},
        byOS: {},
        byCountry: {},
        bySource: {},
        byChannel: {},
        topPages: [],
        topReferrers: []
      }];

      fs.writeFileSync(CACHE_FILE, JSON.stringify(emptyCache, null, 2));
      console.log('✅ Empty cache file created');
      return;
    }

    console.log(`📦 Found ${backupFiles.length} backup file(s):\n`);
    backupFiles.forEach((file, idx) => {
      const timestamp = file.match(/backup-(\d+)/)?.[1];
      const date = timestamp ? new Date(parseInt(timestamp)).toLocaleString() : 'unknown';
      console.log(`   ${idx + 1}. ${file} (${date})`);
    });

    // Use most recent backup
    const mostRecentBackup = path.join(DATA_DIR, backupFiles[0]);
    console.log(`\n🔄 Restoring from most recent backup: ${backupFiles[0]}\n`);

    const backupData = fs.readFileSync(mostRecentBackup, 'utf8');
    const cache = JSON.parse(backupData);

    // Validate cache structure
    if (!Array.isArray(cache)) {
      console.log('❌ Backup file has invalid format (not an array)');
      return;
    }

    // Write to cache file
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));

    console.log('✅ Cache restored successfully!');
    console.log(`   Restored ${cache.length} snapshot(s)`);

    if (cache.length > 0) {
      const latest = cache[cache.length - 1];
      console.log(`   Latest snapshot date: ${latest.date}`);
      console.log(`   Sessions: ${latest.totals?.sessions || 0}`);
      console.log(`   Distinct Users: ${latest.totals?.distinctUsers || 0}`);
    }

  } catch (error) {
    console.error('❌ Error restoring cache:', error.message);
    process.exit(1);
  }
}

// Run the script
restoreClarityCache().then(() => {
  console.log('\n✨ Done!\n');
});
