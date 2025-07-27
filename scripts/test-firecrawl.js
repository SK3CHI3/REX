#!/usr/bin/env node

/**
 * Test script to verify Firecrawl integration
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import FirecrawlApp from '@mendable/firecrawl-js';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function testFirecrawl() {
  console.log('🔥 Testing Firecrawl Integration');
  console.log('='.repeat(50));

  // Check API key
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey || apiKey === 'your_firecrawl_api_key_here') {
    console.error('❌ Firecrawl API key not configured');
    process.exit(1);
  }

  console.log('✅ API key found');

  try {
    // Initialize Firecrawl
    const app = new FirecrawlApp({ apiKey });
    console.log('✅ Firecrawl client initialized');

    // Test with a simple news article
    const testUrl = 'https://nation.africa/kenya';
    console.log(`🔍 Testing scrape with URL: ${testUrl}`);

    const result = await app.scrapeUrl(testUrl, {
      formats: ['markdown'],
      onlyMainContent: true,
      timeout: 30000,
    });

    if (result.success) {
      console.log('✅ Scraping successful!');
      console.log(`📄 Content length: ${result.data?.markdown?.length || 0} characters`);
      console.log(`📰 Title: ${result.data?.metadata?.title || 'N/A'}`);
      console.log(`🔗 URL: ${result.data?.metadata?.sourceURL || 'N/A'}`);
    } else {
      console.error('❌ Scraping failed:', result.error);
    }

    // Test search functionality
    console.log('\n🔍 Testing search functionality...');
    const searchResult = await app.search('police brutality Kenya', {
      limit: 3,
      country: 'KE'
    });

    if (searchResult.success) {
      console.log('✅ Search successful!');
      console.log(`📊 Found ${searchResult.data?.length || 0} results`);
      searchResult.data?.slice(0, 2).forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.title || 'No title'}`);
        console.log(`      ${item.url || 'No URL'}`);
      });
    } else {
      console.error('❌ Search failed:', searchResult.error);
    }

    console.log('\n✅ Firecrawl integration test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    process.exit(1);
  }
}

testFirecrawl();
