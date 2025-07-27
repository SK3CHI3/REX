#!/usr/bin/env node

/**
 * Automated Scraping Service for Kenya Police Brutality Tracker
 * 
 * This script initializes and runs the automated scraping system that:
 * - Monitors Kenyan news sources for police brutality incidents
 * - Extracts structured data using Firecrawl AI
 * - Stores findings in Supabase for review
 * - Runs on a scheduled basis using cron jobs
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env.local') });

// Import our services (we'll create a simple test version)
// import { scrapingScheduler } from '../src/services/scheduler.js';
// import { scrapingOrchestrator } from '../src/services/scraping/index.js';

class ScrapingService {
  constructor() {
    this.isRunning = false;
    this.startTime = null;
  }

  async start() {
    if (this.isRunning) {
      console.log('Scraping service is already running');
      return;
    }

    console.log('🔥 Starting Kenya Police Brutality Tracker - Automated Scraping Service');
    console.log('='.repeat(70));
    
    try {
      // Validate environment variables
      this.validateEnvironment();
      
      // Initialize the scheduler
      console.log('📅 Initializing scraping scheduler...');
      scrapingScheduler.init();
      
      // Start all scheduled jobs
      console.log('🚀 Starting scheduled jobs...');
      scrapingScheduler.startAll();
      
      // Run an initial scraping job
      console.log('🔍 Running initial scraping job...');
      const initialJobs = await scrapingOrchestrator.startAllScrapingJobs();
      console.log(`✅ Started ${initialJobs.length} initial scraping jobs`);
      
      this.isRunning = true;
      this.startTime = new Date();
      
      console.log('='.repeat(70));
      console.log('✅ Scraping service started successfully!');
      console.log(`📊 Dashboard available at: http://localhost:8080/admin/scraping`);
      console.log('🔄 Automated scraping will run every 6 hours');
      console.log('📝 Check logs for scraping progress and results');
      console.log('='.repeat(70));
      
      // Set up graceful shutdown
      this.setupGracefulShutdown();
      
      // Log status every hour
      this.startStatusLogging();
      
    } catch (error) {
      console.error('❌ Failed to start scraping service:', error);
      process.exit(1);
    }
  }

  validateEnvironment() {
    const requiredVars = [
      'FIRECRAWL_API_KEY',
      'VITE_SUPABASE_URL',
      'VITE_SUPABASE_ANON_KEY'
    ];

    const missing = requiredVars.filter(varName => !process.env[varName]);
    
    if (missing.length > 0) {
      console.error('❌ Missing required environment variables:');
      missing.forEach(varName => console.error(`   - ${varName}`));
      throw new Error('Environment validation failed');
    }

    if (process.env.FIRECRAWL_API_KEY === 'your_firecrawl_api_key_here') {
      throw new Error('Please set a valid Firecrawl API key in .env.local');
    }

    console.log('✅ Environment variables validated');
  }

  setupGracefulShutdown() {
    const shutdown = (signal) => {
      console.log(`\n📴 Received ${signal}, shutting down gracefully...`);
      this.stop();
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGQUIT', () => shutdown('SIGQUIT'));
  }

  async stop() {
    if (!this.isRunning) {
      console.log('Scraping service is not running');
      return;
    }

    console.log('🛑 Stopping scraping service...');
    
    try {
      // Stop all scheduled jobs
      scrapingScheduler.stopAll();
      
      // Destroy the scheduler
      scrapingScheduler.destroy();
      
      this.isRunning = false;
      
      const uptime = this.startTime ? 
        Math.round((Date.now() - this.startTime.getTime()) / 1000 / 60) : 0;
      
      console.log(`✅ Scraping service stopped successfully (uptime: ${uptime} minutes)`);
      process.exit(0);
    } catch (error) {
      console.error('❌ Error stopping scraping service:', error);
      process.exit(1);
    }
  }

  startStatusLogging() {
    // Log status every hour
    setInterval(async () => {
      try {
        const stats = await scrapingOrchestrator.getScrapingStats();
        const uptime = this.startTime ? 
          Math.round((Date.now() - this.startTime.getTime()) / 1000 / 60) : 0;
        
        console.log('\n📊 Scraping Service Status Report');
        console.log('-'.repeat(40));
        console.log(`⏱️  Uptime: ${uptime} minutes`);
        console.log(`📈 Total Jobs: ${stats?.total_jobs || 0}`);
        console.log(`✅ Successful: ${stats?.successful_jobs || 0}`);
        console.log(`❌ Failed: ${stats?.failed_jobs || 0}`);
        console.log(`📄 Articles: ${stats?.total_articles_scraped || 0}`);
        console.log(`🔍 Incidents: ${stats?.total_incidents_extracted || 0}`);
        console.log('-'.repeat(40));
      } catch (error) {
        console.error('Error generating status report:', error);
      }
    }, 60 * 60 * 1000); // Every hour
  }

  async getStatus() {
    try {
      const stats = await scrapingOrchestrator.getScrapingStats();
      const schedulerStatus = scrapingScheduler.getJobsStatus();
      
      return {
        running: this.isRunning,
        startTime: this.startTime,
        uptime: this.startTime ? Date.now() - this.startTime.getTime() : 0,
        stats,
        scheduler: schedulerStatus
      };
    } catch (error) {
      console.error('Error getting status:', error);
      return null;
    }
  }
}

// CLI Commands
const command = process.argv[2];
const service = new ScrapingService();

switch (command) {
  case 'start':
    service.start();
    break;
    
  case 'stop':
    service.stop();
    break;
    
  case 'status':
    service.getStatus().then(status => {
      console.log('📊 Scraping Service Status:');
      console.log(JSON.stringify(status, null, 2));
    });
    break;
    
  case 'test':
    console.log('🧪 Testing scraping configuration...');
    // Run a single test scraping job
    scrapingOrchestrator.startAllScrapingJobs().then(jobs => {
      console.log(`✅ Test completed. Started ${jobs.length} jobs.`);
      process.exit(0);
    }).catch(error => {
      console.error('❌ Test failed:', error);
      process.exit(1);
    });
    break;
    
  default:
    console.log('Kenya Police Brutality Tracker - Automated Scraping Service');
    console.log('');
    console.log('Usage:');
    console.log('  node scripts/start-scraper.js start   - Start the scraping service');
    console.log('  node scripts/start-scraper.js stop    - Stop the scraping service');
    console.log('  node scripts/start-scraper.js status  - Show service status');
    console.log('  node scripts/start-scraper.js test    - Test scraping configuration');
    console.log('');
    console.log('Environment Variables Required:');
    console.log('  FIRECRAWL_API_KEY      - Your Firecrawl API key');
    console.log('  VITE_SUPABASE_URL      - Supabase project URL');
    console.log('  VITE_SUPABASE_ANON_KEY - Supabase anonymous key');
    break;
}
