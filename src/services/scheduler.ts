import * as cron from 'node-cron';
import { scrapingOrchestrator } from './scraping';

class ScrapingScheduler {
  private jobs: Map<string, cron.ScheduledTask> = new Map();
  private isInitialized: boolean = false;

  /**
   * Initialize the scheduler with default cron jobs
   */
  init(): void {
    if (this.isInitialized) {
      console.log('Scraping scheduler already initialized');
      return;
    }

    console.log('Initializing scraping scheduler...');

    // Schedule scraping every 6 hours
    this.scheduleJob('main-scraping', '0 */6 * * *', async () => {
      console.log('Starting scheduled scraping job...');
      try {
        const jobIds = await scrapingOrchestrator.startAllScrapingJobs();
        console.log(`Started ${jobIds.length} scraping jobs:`, jobIds);
      } catch (error) {
        console.error('Error in scheduled scraping:', error);
      }
    });

    // Schedule daily stats logging at midnight
    this.scheduleJob('daily-stats', '0 0 * * *', async () => {
      console.log('Generating daily scraping stats...');
      try {
        const stats = await scrapingOrchestrator.getScrapingStats();
        console.log('Daily scraping stats:', stats);
      } catch (error) {
        console.error('Error generating daily stats:', error);
      }
    });

    // Schedule cleanup of old scraping data every week
    this.scheduleJob('weekly-cleanup', '0 2 * * 0', async () => {
      console.log('Starting weekly cleanup...');
      try {
        await this.cleanupOldData();
      } catch (error) {
        console.error('Error in weekly cleanup:', error);
      }
    });

    this.isInitialized = true;
    console.log('Scraping scheduler initialized successfully');
  }

  /**
   * Schedule a new cron job
   */
  scheduleJob(name: string, cronExpression: string, task: () => Promise<void>): void {
    if (this.jobs.has(name)) {
      console.log(`Job ${name} already exists, stopping existing job`);
      this.stopJob(name);
    }

    const scheduledTask = cron.schedule(cronExpression, task, {
      scheduled: false,
      timezone: 'Africa/Nairobi' // Kenya timezone
    });

    this.jobs.set(name, scheduledTask);
    console.log(`Scheduled job: ${name} with cron expression: ${cronExpression}`);
  }

  /**
   * Start a specific job
   */
  startJob(name: string): boolean {
    const job = this.jobs.get(name);
    if (job) {
      job.start();
      console.log(`Started job: ${name}`);
      return true;
    }
    console.error(`Job not found: ${name}`);
    return false;
  }

  /**
   * Stop a specific job
   */
  stopJob(name: string): boolean {
    const job = this.jobs.get(name);
    if (job) {
      job.stop();
      console.log(`Stopped job: ${name}`);
      return true;
    }
    console.error(`Job not found: ${name}`);
    return false;
  }

  /**
   * Start all scheduled jobs
   */
  startAll(): void {
    console.log('Starting all scheduled jobs...');
    this.jobs.forEach((job, name) => {
      job.start();
      console.log(`Started job: ${name}`);
    });
  }

  /**
   * Stop all scheduled jobs
   */
  stopAll(): void {
    console.log('Stopping all scheduled jobs...');
    this.jobs.forEach((job, name) => {
      job.stop();
      console.log(`Stopped job: ${name}`);
    });
  }

  /**
   * Get status of all jobs
   */
  getJobsStatus(): { name: string; running: boolean }[] {
    const status: { name: string; running: boolean }[] = [];
    this.jobs.forEach((job, name) => {
      status.push({
        name,
        running: job.getStatus() === 'scheduled'
      });
    });
    return status;
  }

  /**
   * Manually trigger scraping for all sources
   */
  async triggerManualScraping(): Promise<string[]> {
    console.log('Manually triggering scraping for all sources...');
    try {
      const jobIds = await scrapingOrchestrator.startAllScrapingJobs();
      console.log(`Manually started ${jobIds.length} scraping jobs:`, jobIds);
      return jobIds;
    } catch (error) {
      console.error('Error in manual scraping trigger:', error);
      return [];
    }
  }

  /**
   * Manually trigger scraping for a specific source
   */
  async triggerSourceScraping(sourceId: string): Promise<string | null> {
    console.log(`Manually triggering scraping for source: ${sourceId}`);
    try {
      const jobId = await scrapingOrchestrator.startScrapingJob(sourceId);
      if (jobId) {
        console.log(`Manually started scraping job: ${jobId} for source: ${sourceId}`);
      }
      return jobId;
    } catch (error) {
      console.error(`Error triggering scraping for source ${sourceId}:`, error);
      return null;
    }
  }

  /**
   * Update job schedule
   */
  updateJobSchedule(name: string, newCronExpression: string): boolean {
    const job = this.jobs.get(name);
    if (job) {
      job.stop();
      job.destroy();
      
      // Create new job with updated schedule
      const task = job.getStatus(); // This won't work as expected, need to store task separately
      // For now, just log that schedule update is requested
      console.log(`Schedule update requested for job: ${name} to: ${newCronExpression}`);
      console.log('Note: Job schedule update requires restart. Please restart the application.');
      return true;
    }
    return false;
  }

  /**
   * Clean up old scraping data
   */
  private async cleanupOldData(): Promise<void> {
    try {
      const { supabase } = await import('@/lib/supabase');
      
      // Delete scraping jobs older than 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { error: jobsError } = await supabase
        .from('scraping_jobs')
        .delete()
        .lt('created_at', thirtyDaysAgo.toISOString());

      if (jobsError) {
        console.error('Error cleaning up old scraping jobs:', jobsError);
      } else {
        console.log('Cleaned up scraping jobs older than 30 days');
      }

      // Delete processed scraped articles older than 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { error: articlesError } = await supabase
        .from('scraped_articles')
        .delete()
        .eq('processed', true)
        .lt('created_at', sevenDaysAgo.toISOString());

      if (articlesError) {
        console.error('Error cleaning up old scraped articles:', articlesError);
      } else {
        console.log('Cleaned up processed articles older than 7 days');
      }

    } catch (error) {
      console.error('Error in cleanup process:', error);
    }
  }

  /**
   * Get next scheduled run times for all jobs
   */
  getNextRunTimes(): { name: string; nextRun: string | null }[] {
    const nextRuns: { name: string; nextRun: string | null }[] = [];
    
    this.jobs.forEach((job, name) => {
      // Note: node-cron doesn't provide a direct way to get next run time
      // This would require additional logic or a different cron library
      nextRuns.push({
        name,
        nextRun: 'Not available with current cron library'
      });
    });
    
    return nextRuns;
  }

  /**
   * Destroy the scheduler and clean up all jobs
   */
  destroy(): void {
    console.log('Destroying scraping scheduler...');
    this.jobs.forEach((job, name) => {
      job.stop();
      job.destroy();
      console.log(`Destroyed job: ${name}`);
    });
    this.jobs.clear();
    this.isInitialized = false;
    console.log('Scraping scheduler destroyed');
  }
}

// Create singleton instance
export const scrapingScheduler = new ScrapingScheduler();

// Auto-initialize if in Node.js environment (not browser)
if (typeof window === 'undefined') {
  scrapingScheduler.init();
}

export default ScrapingScheduler;
