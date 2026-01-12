#!/usr/bin/env node

/**
 * Script to test Clarity API integration directly
 * Bypasses the Next.js server to test the API function
 */

require('dotenv').config();

async function testClarityAPI() {
  console.log('🔍 Testing Clarity API Integration...\n');

  // Check environment variables
  const token = process.env.CLARITY_TOKEN;
  const projectId = process.env.CLARITY_PROJECT_ID;
  const strategy = process.env.CLARITY_API_STRATEGY || 'minimal';

  if (!token || !projectId) {
    console.error('❌ Missing environment variables!');
    console.error('   CLARITY_TOKEN:', token ? '✅ Set' : '❌ Missing');
    console.error('   CLARITY_PROJECT_ID:', projectId ? '✅ Set' : '❌ Missing');
    process.exit(1);
  }

  console.log('✅ Environment variables found:');
  console.log(`   Strategy: ${strategy}`);
  console.log(`   Project ID: ${projectId}`);
  console.log(`   Token: ${token.substring(0, 20)}...`);
  console.log('');

  // Import and test the function
  try {
    console.log('📡 Fetching data from Clarity API...');
    console.log(`   Using "${strategy}" strategy`);

    const callsNeeded = strategy === 'full' ? 5 : strategy === 'balanced' ? 3 : 2;
    console.log(`   This will use ${callsNeeded} API calls\n`);

    // Dynamically import the module
    const clarityModule = await import('../src/lib/clarity.ts');
    const { getClarityData } = clarityModule;

    const startTime = Date.now();
    const data = await getClarityData();
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`✅ Success! Data fetched in ${duration}s\n`);
    console.log('📊 Summary:');
    console.log(`   Date: ${data.date}`);
    console.log(`   Sessions: ${data.totals.sessions.toLocaleString()}`);
    console.log(`   Users: ${data.totals.distinctUsers.toLocaleString()}`);
    console.log(`   Engagement: ${Math.round(data.totals.engagementTimeAvg)}s`);
    console.log(`   Scroll Depth: ${Math.round(data.totals.scrollDepthAvg)}%`);
    console.log('');
    console.log('📱 Devices:');
    Object.entries(data.byDevice).forEach(([device, count]) => {
      console.log(`   ${device}: ${count}`);
    });
    console.log('');
    console.log('🌐 Browsers:');
    Object.entries(data.byBrowser).forEach(([browser, count]) => {
      console.log(`   ${browser}: ${count}`);
    });
    console.log('');
    console.log(`📄 Top Pages: ${data.topPages.length} found`);
    data.topPages.slice(0, 3).forEach((page, i) => {
      console.log(`   ${i + 1}. ${page.sessions} sessions - ${page.url}`);
    });
    console.log('');

    // Save to cache
    const fs = require('fs');
    const path = require('path');
    const CACHE_PATH = path.resolve(process.cwd(), 'data/clarityCache.json');

    await fs.promises.mkdir(path.dirname(CACHE_PATH), { recursive: true });

    let cache = [];
    try {
      const existing = await fs.promises.readFile(CACHE_PATH, 'utf8');
      cache = JSON.parse(existing);
    } catch {}

    cache = cache.filter(s => s.date !== data.date);
    cache.push(data);
    cache = cache.slice(-30);

    await fs.promises.writeFile(CACHE_PATH, JSON.stringify(cache, null, 2));
    console.log(`💾 Data saved to cache: ${CACHE_PATH}`);
    console.log(`   Cache now has ${cache.length} day(s) of data\n`);

    console.log('🎉 All done! Your Clarity integration is working perfectly!');
    console.log(`\n📍 Next: Visit http://localhost:3000/clarity-dashboard to see the full dashboard`);

  } catch (error) {
    console.error('\n❌ Error fetching data:', error.message);

    if (error.message.includes('401')) {
      console.error('\n💡 This looks like an authentication error.');
      console.error('   Check that your CLARITY_TOKEN is valid and not expired.');
    } else if (error.message.includes('429')) {
      console.error('\n💡 Rate limit reached!');
      console.error('   You\'ve used all 10 API calls for today. Try again tomorrow.');
    } else if (error.message.includes('403')) {
      console.error('\n💡 Permission denied.');
      console.error('   Make sure your API token has Data Export permissions.');
    }

    process.exit(1);
  }
}

testClarityAPI();
