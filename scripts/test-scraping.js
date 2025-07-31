#!/usr/bin/env node

/**
 * Test script for the Kenya Police Brutality Tracker scraping system
 * This script tests the scraping functionality and incident extraction
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Required: VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testScrapingSystem() {
  console.log('🧪 Testing Kenya Police Brutality Tracker Scraping System\n');

  try {
    // Test 1: Check scraping sources
    console.log('1️⃣ Testing scraping sources...');
    const { data: sources, error: sourcesError } = await supabase
      .from('scraping_sources')
      .select('*')
      .eq('enabled', true);

    if (sourcesError) {
      console.error('❌ Error fetching sources:', sourcesError);
      return;
    }

    console.log(`✅ Found ${sources?.length || 0} enabled sources:`);
    sources?.forEach(source => {
      console.log(`   - ${source.name} (${source.base_url})`);
    });

    // Test 2: Check scraping stats function
    console.log('\n2️⃣ Testing scraping stats function...');
    const { data: stats, error: statsError } = await supabase.rpc('get_scraping_stats');

    if (statsError) {
      console.error('❌ Error getting stats:', statsError);
    } else {
      console.log('✅ Scraping stats retrieved successfully');
      console.log(`   - Total jobs: ${stats.total_jobs}`);
      console.log(`   - Successful jobs: ${stats.successful_jobs}`);
      console.log(`   - Failed jobs: ${stats.failed_jobs}`);
    }

    // Test 3: Test edge function (if available)
    console.log('\n3️⃣ Testing edge function...');
    try {
      const { data: edgeResult, error: edgeError } = await supabase.functions.invoke('scrape-incidents', {
        body: { test: true, manual: true }
      });

      if (edgeError) {
        console.error('❌ Edge function error:', edgeError);
      } else {
        console.log('✅ Edge function responded successfully');
        console.log('   Response:', edgeResult);
      }
    } catch (error) {
      console.error('❌ Edge function test failed:', error.message);
    }

    // Test 4: Check recent scraping jobs
    console.log('\n4️⃣ Checking recent scraping jobs...');
    const { data: jobs, error: jobsError } = await supabase
      .from('scraping_jobs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (jobsError) {
      console.error('❌ Error fetching jobs:', jobsError);
    } else {
      console.log(`✅ Found ${jobs?.length || 0} recent jobs`);
      jobs?.forEach(job => {
        console.log(`   - ${job.status} job from ${new Date(job.created_at).toLocaleString()}`);
      });
    }

    console.log('\n🎉 Scraping system test completed!');
    console.log('\n📋 Summary:');
    console.log(`   - Sources configured: ${sources?.length || 0}`);
    console.log(`   - Recent jobs: ${jobs?.length || 0}`);
    console.log(`   - Stats function: ${statsError ? '❌' : '✅'}`);

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testScrapingSystem();
