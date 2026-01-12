#!/usr/bin/env node

/**
 * Script to clear the Clarity cache and force a fresh data fetch
 * Run this if you've updated the data structure and need to reset the cache
 */

const fs = require('fs');
const path = require('path');

const CACHE_PATH = path.resolve(process.cwd(), 'data/clarityCache.json');

try {
  if (fs.existsSync(CACHE_PATH)) {
    // Backup the old cache
    const backupPath = CACHE_PATH.replace('.json', `.backup-${Date.now()}.json`);
    fs.copyFileSync(CACHE_PATH, backupPath);
    console.log(`✅ Backed up old cache to: ${backupPath}`);

    // Clear the cache
    fs.unlinkSync(CACHE_PATH);
    console.log('✅ Cleared Clarity cache');
    console.log('\n📝 Next steps:');
    console.log('1. Make sure your .env has CLARITY_TOKEN and CLARITY_PROJECT_ID');
    console.log('2. Visit /clarity-dashboard and click "Refresh Data"');
    console.log('3. Or use: curl -X POST http://localhost:3000/api/clarity\n');
  } else {
    console.log('ℹ️  No cache file found - nothing to clear');
  }
} catch (error) {
  console.error('❌ Error clearing cache:', error.message);
  process.exit(1);
}
