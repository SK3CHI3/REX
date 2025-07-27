import { supabase } from '@/lib/supabase';
import { firecrawlService } from '@/services/firecrawl';
import { ScrapingJob, ScrapingSource, ScrapedIncident, ScrapedArticle } from '@/types/scraping';

class ScrapingOrchestrator {
  private isRunning: boolean = false;
  private currentJobs: Map<string, boolean> = new Map();

  /**
   * Start a scraping job for a specific source
   */
  async startScrapingJob(sourceId: string): Promise<string | null> {
    if (this.currentJobs.get(sourceId)) {
      console.log(`Scraping job already running for source: ${sourceId}`);
      return null;
    }

    try {
      // Get source configuration
      const { data: source, error: sourceError } = await supabase
        .from('scraping_sources')
        .select('*')
        .eq('id', sourceId)
        .eq('enabled', true)
        .single();

      if (sourceError || !source) {
        console.error('Source not found or disabled:', sourceId);
        return null;
      }

      // Create new scraping job
      const { data: job, error: jobError } = await supabase
        .from('scraping_jobs')
        .insert({
          source_id: sourceId,
          status: 'pending'
        })
        .select()
        .single();

      if (jobError || !job) {
        console.error('Failed to create scraping job:', jobError);
        return null;
      }

      // Start the job asynchronously
      this.executeScrapingJob(job.id, source);

      return job.id;
    } catch (error) {
      console.error('Error starting scraping job:', error);
      return null;
    }
  }

  /**
   * Execute a scraping job
   */
  private async executeScrapingJob(jobId: string, source: ScrapingSource): Promise<void> {
    this.currentJobs.set(source.id, true);

    try {
      // Update job status to running
      await supabase
        .from('scraping_jobs')
        .update({ status: 'running' })
        .eq('id', jobId);

      console.log(`Starting scraping job ${jobId} for source: ${source.name}`);

      // Collect URLs to scrape
      const urlsToScrape = await this.collectUrlsToScrape(source);
      
      if (urlsToScrape.length === 0) {
        console.log(`No URLs found for source: ${source.name}`);
        await this.completeJob(jobId, 0, 0, []);
        return;
      }

      console.log(`Found ${urlsToScrape.length} URLs to scrape for ${source.name}`);

      // Scrape articles and extract incidents
      const { articles, incidents } = await this.scrapeAndExtract(jobId, urlsToScrape, source);

      // Store results and complete job
      await this.completeJob(jobId, articles.length, incidents.length, urlsToScrape);

      // Update source last_scraped timestamp
      await supabase
        .from('scraping_sources')
        .update({ last_scraped: new Date().toISOString() })
        .eq('id', source.id);

      console.log(`Completed scraping job ${jobId}: ${articles.length} articles, ${incidents.length} incidents`);

    } catch (error) {
      console.error(`Error in scraping job ${jobId}:`, error);
      
      await supabase
        .from('scraping_jobs')
        .update({ 
          status: 'failed',
          completed_at: new Date().toISOString(),
          error_message: error instanceof Error ? error.message : 'Unknown error'
        })
        .eq('id', jobId);
    } finally {
      this.currentJobs.delete(source.id);
    }
  }

  /**
   * Collect URLs to scrape from a source
   */
  private async collectUrlsToScrape(source: ScrapingSource): Promise<string[]> {
    const allUrls: Set<string> = new Set();

    try {
      // Search for relevant articles using search URLs
      for (const searchUrl of source.search_urls) {
        try {
          const searchResults = await firecrawlService.searchIncidents(
            'police brutality Kenya OR police violence Kenya OR extrajudicial killing Kenya',
            20
          );
          searchResults.forEach(url => allUrls.add(url));
        } catch (error) {
          console.error(`Error searching with URL ${searchUrl}:`, error);
        }
      }

      // Crawl category pages for additional articles
      for (const categoryUrl of source.category_urls) {
        try {
          const crawlResults = await firecrawlService.crawlNewsSource(categoryUrl, [
            'police brutality', 'police violence', 'extrajudicial killing',
            'unlawful arrest', 'police harassment', 'human rights violation'
          ]);
          crawlResults.forEach(url => allUrls.add(url));
        } catch (error) {
          console.error(`Error crawling category ${categoryUrl}:`, error);
        }
      }

      // Filter out URLs we've already processed
      const urlsArray = Array.from(allUrls);
      const { data: existingArticles } = await supabase
        .from('scraped_articles')
        .select('url')
        .in('url', urlsArray);

      const existingUrls = new Set(existingArticles?.map(a => a.url) || []);
      const newUrls = urlsArray.filter(url => !existingUrls.has(url));

      return newUrls.slice(0, 50); // Limit to 50 URLs per job
    } catch (error) {
      console.error('Error collecting URLs to scrape:', error);
      return [];
    }
  }

  /**
   * Scrape articles and extract incidents
   */
  private async scrapeAndExtract(
    jobId: string, 
    urls: string[], 
    source: ScrapingSource
  ): Promise<{ articles: ScrapedArticle[], incidents: ScrapedIncident[] }> {
    const articles: ScrapedArticle[] = [];
    const incidents: ScrapedIncident[] = [];

    // Process URLs in batches
    const batchSize = 5;
    for (let i = 0; i < urls.length; i += batchSize) {
      const batch = urls.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (url) => {
        try {
          // Scrape the article and extract incident data
          const incident = await firecrawlService.scrapeIncident(url);
          
          if (incident) {
            // Store the article
            const { data: article } = await supabase
              .from('scraped_articles')
              .insert({
                job_id: jobId,
                url: url,
                title: incident.article_title,
                content: incident.description,
                published_date: incident.published_date,
                processed: true,
                incidents_extracted: 1
              })
              .select()
              .single();

            if (article) {
              articles.push(article);
            }

            // Check for duplicates before storing incident
            const isDuplicate = await this.checkForDuplicate(incident);
            
            if (!isDuplicate) {
              incidents.push(incident);
              
              // Store incident in case_submissions for review
              await this.storeIncidentForReview(incident, jobId);
            }
          }
        } catch (error) {
          console.error(`Error processing URL ${url}:`, error);
        }
      });

      await Promise.allSettled(batchPromises);
      
      // Add delay between batches
      if (i + batchSize < urls.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    return { articles, incidents };
  }

  /**
   * Check if an incident is a duplicate
   */
  private async checkForDuplicate(incident: ScrapedIncident): Promise<boolean> {
    try {
      // Check by URL first
      const { data: existingByUrl } = await supabase
        .from('cases')
        .select('id')
        .eq('scraped_from_url', incident.article_url)
        .limit(1);

      if (existingByUrl && existingByUrl.length > 0) {
        return true;
      }

      // Check by similar content (victim name + location + date)
      if (incident.victim_name && incident.location && incident.incident_date) {
        const { data: existingSimilar } = await supabase
          .from('cases')
          .select('id')
          .eq('victim_name', incident.victim_name)
          .eq('location', incident.location)
          .eq('incident_date', incident.incident_date)
          .limit(1);

        if (existingSimilar && existingSimilar.length > 0) {
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Error checking for duplicates:', error);
      return false;
    }
  }

  /**
   * Store incident for manual review
   */
  private async storeIncidentForReview(incident: ScrapedIncident, jobId: string): Promise<void> {
    try {
      const submissionData = {
        victim_name: incident.victim_name,
        age: incident.age,
        incident_date: incident.incident_date,
        location: incident.location,
        county: incident.county,
        case_type: incident.case_type,
        description: incident.description,
        reporter_name: 'Automated Scraper',
        reporter_contact: 'system@automated-scraper.com',
        status: incident.confidence_score && incident.confidence_score >= 80 ? 'approved' : 'pending',
        scraped_from_url: incident.article_url,
        scraping_job_id: jobId,
        confidence_score: incident.confidence_score,
        auto_approved: incident.confidence_score && incident.confidence_score >= 80
      };

      await supabase
        .from('case_submissions')
        .insert(submissionData);

      // If high confidence, also add directly to cases table
      if (incident.confidence_score && incident.confidence_score >= 80) {
        await supabase
          .from('cases')
          .insert({
            victim_name: incident.victim_name,
            age: incident.age,
            incident_date: incident.incident_date,
            location: incident.location,
            county: incident.county,
            case_type: incident.case_type,
            description: incident.description,
            status: 'verified',
            source: incident.source,
            scraped_from_url: incident.article_url,
            scraping_job_id: jobId,
            confidence_score: incident.confidence_score,
            auto_approved: true
          });
      }
    } catch (error) {
      console.error('Error storing incident for review:', error);
    }
  }

  /**
   * Complete a scraping job
   */
  private async completeJob(
    jobId: string, 
    articlesFound: number, 
    incidentsExtracted: number, 
    urlsScraped: string[]
  ): Promise<void> {
    await supabase
      .from('scraping_jobs')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        articles_found: articlesFound,
        incidents_extracted: incidentsExtracted,
        urls_scraped: urlsScraped
      })
      .eq('id', jobId);
  }

  /**
   * Start scraping jobs for all enabled sources
   */
  async startAllScrapingJobs(): Promise<string[]> {
    const { data: sources, error } = await supabase
      .from('scraping_sources')
      .select('*')
      .eq('enabled', true);

    if (error || !sources) {
      console.error('Error fetching scraping sources:', error);
      return [];
    }

    const jobIds: string[] = [];
    
    for (const source of sources) {
      // Check if enough time has passed since last scrape
      const shouldScrape = this.shouldScrapeSource(source);
      
      if (shouldScrape) {
        const jobId = await this.startScrapingJob(source.id);
        if (jobId) {
          jobIds.push(jobId);
        }
      }
    }

    return jobIds;
  }

  /**
   * Check if a source should be scraped based on its interval
   */
  private shouldScrapeSource(source: ScrapingSource): boolean {
    if (!source.last_scraped) {
      return true; // Never scraped before
    }

    const lastScraped = new Date(source.last_scraped);
    const now = new Date();
    const hoursSinceLastScrape = (now.getTime() - lastScraped.getTime()) / (1000 * 60 * 60);

    return hoursSinceLastScrape >= source.scraping_interval_hours;
  }

  /**
   * Get scraping statistics
   */
  async getScrapingStats(): Promise<any> {
    try {
      const { data: jobs } = await supabase
        .from('scraping_jobs')
        .select('*');

      const { data: sources } = await supabase
        .from('scraping_sources')
        .select('*');

      const totalJobs = jobs?.length || 0;
      const successfulJobs = jobs?.filter(j => j.status === 'completed').length || 0;
      const failedJobs = jobs?.filter(j => j.status === 'failed').length || 0;

      return {
        total_jobs: totalJobs,
        successful_jobs: successfulJobs,
        failed_jobs: failedJobs,
        total_articles_scraped: jobs?.reduce((sum, job) => sum + (job.articles_found || 0), 0) || 0,
        total_incidents_extracted: jobs?.reduce((sum, job) => sum + (job.incidents_extracted || 0), 0) || 0,
        sources_status: sources?.map(source => ({
          source_id: source.id,
          source_name: source.name,
          last_scraped: source.last_scraped,
          status: source.enabled ? 'active' : 'disabled'
        })) || []
      };
    } catch (error) {
      console.error('Error getting scraping stats:', error);
      return null;
    }
  }
}

export const scrapingOrchestrator = new ScrapingOrchestrator();
export default ScrapingOrchestrator;
