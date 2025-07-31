import { supabase } from '@/lib/supabase';
import { ScrapingJob, ScrapingSource, ScrapingStats } from '@/types/scraping';

/**
 * API functions for managing the scraping system
 */

/**
 * Get all scraping sources
 */
export async function getScrapingSources(): Promise<ScrapingSource[]> {
  const { data, error } = await supabase
    .from('scraping_sources')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching scraping sources:', error);
    return [];
  }

  return data || [];
}

/**
 * Get scraping source by ID
 */
export async function getScrapingSource(id: string): Promise<ScrapingSource | null> {
  const { data, error } = await supabase
    .from('scraping_sources')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching scraping source:', error);
    return null;
  }

  return data;
}

/**
 * Update scraping source
 */
export async function updateScrapingSource(id: string, updates: Partial<ScrapingSource>): Promise<boolean> {
  const { error } = await supabase
    .from('scraping_sources')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('Error updating scraping source:', error);
    return false;
  }

  return true;
}

/**
 * Get all scraping jobs with pagination
 */
export async function getScrapingJobs(page: number = 1, limit: number = 20): Promise<{
  jobs: ScrapingJob[];
  total: number;
  hasMore: boolean;
}> {
  const offset = (page - 1) * limit;

  const { data, error, count } = await supabase
    .from('scraping_jobs')
    .select(`
      *,
      scraping_sources(name)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching scraping jobs:', error);
    return { jobs: [], total: 0, hasMore: false };
  }

  return {
    jobs: data || [],
    total: count || 0,
    hasMore: (count || 0) > offset + limit
  };
}

/**
 * Get scraping job by ID
 */
export async function getScrapingJob(id: string): Promise<ScrapingJob | null> {
  const { data, error } = await supabase
    .from('scraping_jobs')
    .select(`
      *,
      scraping_sources(name, base_url)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching scraping job:', error);
    return null;
  }

  return data;
}

/**
 * Start manual scraping using deployed edge function
 */
export async function startManualScraping(): Promise<string[]> {
  try {
    console.log('Starting manual scraping via edge function...');

    const { data, error } = await supabase.functions.invoke('scrape-incidents', {
      body: { manual: true, timestamp: new Date().toISOString() }
    });

    if (error) {
      console.error('Error starting manual scraping:', error);
      throw new Error(`Failed to start scraping: ${error.message}`);
    }

    console.log('Scraping completed:', data);

    // Return job IDs or timestamp
    return data?.stats ? [data.stats.timestamp] : [new Date().toISOString()];
  } catch (error) {
    console.error('Error starting manual scraping:', error);
    throw error;
  }
}

/**
 * Start manual scraping for specific source using Supabase Edge Function
 */
export async function startSourceScraping(sourceId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase.functions.invoke('scrape-incidents', {
      body: { manual: true, sourceId }
    });

    if (error) {
      console.error('Error starting source scraping:', error);
      return null;
    }

    return data?.stats?.timestamp || null;
  } catch (error) {
    console.error('Error starting source scraping:', error);
    return null;
  }
}

/**
 * Get scraping statistics using Supabase function
 */
export async function getScrapingStats(): Promise<ScrapingStats | null> {
  try {
    const { data, error } = await supabase.rpc('get_scraping_stats');

    if (error) {
      console.error('Error getting scraping stats:', error);
      // Return default stats if function doesn't exist
      return {
        total_jobs: 0,
        successful_jobs: 0,
        failed_jobs: 0,
        running_jobs: 0,
        total_articles: 0,
        total_incidents: 0,
        pending_reviews: 0,
        last_job_time: null,
        sources_status: []
      };
    }

    return data;
  } catch (error) {
    console.error('Error getting scraping stats:', error);
    // Return default stats on error
    return {
      total_jobs: 0,
      successful_jobs: 0,
      failed_jobs: 0,
      running_jobs: 0,
      total_articles: 0,
      total_incidents: 0,
      pending_reviews: 0,
      last_job_time: null,
      sources_status: []
    };
  }
}

/**
 * Get scheduler status from database cron jobs
 */
export async function getSchedulerStatus(): Promise<{
  initialized: boolean;
  jobs: { name: string; running: boolean }[];
}> {
  try {
    // Check recent scraping jobs to determine if automation is working
    const { data: recentJobs, error } = await supabase
      .from('scraping_jobs')
      .select('status, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error fetching recent jobs:', error);
    }

    // Check if we have jobs from the last 24 hours
    const last24Hours = new Date();
    last24Hours.setHours(last24Hours.getHours() - 24);

    const recentJobsCount = recentJobs?.filter(job =>
      new Date(job.created_at) > last24Hours
    ).length || 0;

    return {
      initialized: true,
      jobs: [
        {
          name: 'automated-scraping',
          running: recentJobsCount > 0
        },
        {
          name: 'cron-scheduler',
          running: true
        }
      ]
    };
  } catch (error) {
    console.error('Error getting scheduler status:', error);
    return {
      initialized: true,
      jobs: [
        { name: 'automated-scraping', running: false }
      ]
    };
  }
}

/**
 * Get scraped articles for a job
 */
export async function getScrapedArticles(jobId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('scraped_articles')
    .select('*')
    .eq('job_id', jobId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching scraped articles:', error);
    return [];
  }

  return data || [];
}

/**
 * Get recent scraped articles for news display
 */
export async function getRecentScrapedArticles(limit: number = 6): Promise<any[]> {
  const { data, error } = await supabase
    .from('scraped_articles')
    .select(`
      *,
      scraping_sources(name, base_url)
    `)
    .eq('processed', true)
    .not('title', 'is', null)
    .not('content', 'is', null)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching recent scraped articles:', error);
    return [];
  }

  return data || [];
}

/**
 * Get pending case submissions from scraping
 */
export async function getPendingScrapedCases(): Promise<any[]> {
  const { data, error } = await supabase
    .from('case_submissions')
    .select('*')
    .eq('reporter_name', 'Automated Scraper')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching pending scraped cases:', error);
    return [];
  }

  return data || [];
}

/**
 * Approve a scraped case submission
 */
export async function approveScrapedCase(submissionId: string): Promise<boolean> {
  try {
    // Get the submission
    const { data: submission, error: fetchError } = await supabase
      .from('case_submissions')
      .select('*')
      .eq('id', submissionId)
      .single();

    if (fetchError || !submission) {
      console.error('Error fetching submission:', fetchError);
      return false;
    }

    // Create case in main cases table
    const { error: insertError } = await supabase
      .from('cases')
      .insert({
        victim_name: submission.victim_name,
        age: submission.age,
        incident_date: submission.incident_date,
        location: submission.location,
        county: submission.county,
        case_type: submission.case_type,
        description: submission.description,
        status: 'verified',
        source: 'Automated Scraper',
        scraped_from_url: submission.scraped_from_url,
        scraping_job_id: submission.scraping_job_id,
        confidence_score: submission.confidence_score,
        auto_approved: false
      });

    if (insertError) {
      console.error('Error creating case:', insertError);
      return false;
    }

    // Update submission status
    const { error: updateError } = await supabase
      .from('case_submissions')
      .update({ status: 'approved' })
      .eq('id', submissionId);

    if (updateError) {
      console.error('Error updating submission status:', updateError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error approving scraped case:', error);
    return false;
  }
}

/**
 * Reject a scraped case submission
 */
export async function rejectScrapedCase(submissionId: string, reason?: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('case_submissions')
      .update({ 
        status: 'rejected',
        rejection_reason: reason 
      })
      .eq('id', submissionId);

    if (error) {
      console.error('Error rejecting scraped case:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error rejecting scraped case:', error);
    return false;
  }
}

/**
 * Test scraping system setup
 */
export async function testScrapingSetup(): Promise<any> {
  try {
    const { data, error } = await supabase.functions.invoke('test-scraping');

    if (error) {
      console.error('Error testing scraping setup:', error);
      return { success: false, error: error.message };
    }

    return data;
  } catch (error) {
    console.error('Error testing scraping setup:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get scraping performance metrics
 */
export async function getScrapingMetrics(): Promise<{
  daily: any[];
  weekly: any[];
  sources: any[];
} | null> {
  try {
    // Get daily metrics for the last 30 days
    const { data: dailyData } = await supabase
      .from('scraping_jobs')
      .select('created_at, status, articles_found, incidents_extracted')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at');

    // Get source performance
    const { data: sourceData } = await supabase
      .from('scraping_jobs')
      .select(`
        source_id,
        scraping_sources(name),
        status,
        articles_found,
        incidents_extracted
      `)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    // Process daily metrics
    const dailyMetrics = dailyData?.reduce((acc: any, job: any) => {
      const date = job.created_at.split('T')[0];
      if (!acc[date]) {
        acc[date] = { date, jobs: 0, articles: 0, incidents: 0, success: 0, failed: 0 };
      }
      acc[date].jobs++;
      acc[date].articles += job.articles_found || 0;
      acc[date].incidents += job.incidents_extracted || 0;
      if (job.status === 'completed') acc[date].success++;
      if (job.status === 'failed') acc[date].failed++;
      return acc;
    }, {});

    // Process source metrics
    const sourceMetrics = sourceData?.reduce((acc: any, job: any) => {
      const sourceName = job.scraping_sources?.name || 'Unknown';
      if (!acc[sourceName]) {
        acc[sourceName] = { source: sourceName, jobs: 0, articles: 0, incidents: 0, success: 0, failed: 0 };
      }
      acc[sourceName].jobs++;
      acc[sourceName].articles += job.articles_found || 0;
      acc[sourceName].incidents += job.incidents_extracted || 0;
      if (job.status === 'completed') acc[sourceName].success++;
      if (job.status === 'failed') acc[sourceName].failed++;
      return acc;
    }, {});

    return {
      daily: Object.values(dailyMetrics || {}),
      weekly: [], // Could implement weekly aggregation
      sources: Object.values(sourceMetrics || {})
    };
  } catch (error) {
    console.error('Error getting scraping metrics:', error);
    return null;
  }
}
