import FirecrawlApp from '@mendable/firecrawl-js';
import { ScrapedIncident, ExtractionSchema } from '@/types/scraping';

class FirecrawlService {
  private app: FirecrawlApp;
  private isInitialized: boolean = false;

  constructor() {
    const apiKey = process.env.FIRECRAWL_API_KEY || import.meta.env.VITE_FIRECRAWL_API_KEY;
    
    if (!apiKey || apiKey === 'your_firecrawl_api_key_here') {
      console.warn('Firecrawl API key not configured. Please set FIRECRAWL_API_KEY environment variable.');
      return;
    }

    this.app = new FirecrawlApp({ apiKey });
    this.isInitialized = true;
  }

  private checkInitialization() {
    if (!this.isInitialized) {
      throw new Error('Firecrawl service not initialized. Please check your API key configuration.');
    }
  }

  /**
   * Scrape a single URL and extract incident data
   */
  async scrapeIncident(url: string): Promise<ScrapedIncident | null> {
    this.checkInitialization();

    try {
      const result = await this.app.scrapeUrl(url, {
        formats: ['markdown', 'json'],
        jsonOptions: {
          schema: this.getIncidentExtractionSchema(),
        },
        onlyMainContent: true,
        timeout: 30000,
      });

      if (!result.success || !result.data) {
        console.error('Failed to scrape URL:', url);
        return null;
      }

      const extractedData = result.data.json as any;
      
      // Validate and clean extracted data
      const incident = this.validateAndCleanIncident(extractedData, url, result.data.metadata);
      
      return incident;
    } catch (error) {
      console.error('Error scraping incident from URL:', url, error);
      return null;
    }
  }

  /**
   * Crawl a news website and find police brutality related articles
   */
  async crawlNewsSource(baseUrl: string, searchTerms: string[] = []): Promise<string[]> {
    this.checkInitialization();

    try {
      // First, map the website to get all URLs
      const mapResult = await this.app.mapUrl(baseUrl, {
        search: searchTerms.join(' OR '),
        limit: 100,
      });

      if (!mapResult.success || !mapResult.data) {
        console.error('Failed to map website:', baseUrl);
        return [];
      }

      // Filter URLs that likely contain police brutality content
      const relevantUrls = mapResult.data.filter((url: string) => 
        this.isRelevantUrl(url, searchTerms)
      );

      return relevantUrls;
    } catch (error) {
      console.error('Error crawling news source:', baseUrl, error);
      return [];
    }
  }

  /**
   * Search the web for police brutality incidents
   */
  async searchIncidents(query: string, limit: number = 10): Promise<string[]> {
    this.checkInitialization();

    try {
      const searchResult = await this.app.search(query, {
        limit,
        country: 'KE', // Kenya
      });

      if (!searchResult.success || !searchResult.data) {
        console.error('Failed to search for incidents:', query);
        return [];
      }

      return searchResult.data.map((result: any) => result.url);
    } catch (error) {
      console.error('Error searching for incidents:', query, error);
      return [];
    }
  }

  /**
   * Batch scrape multiple URLs
   */
  async batchScrapeIncidents(urls: string[]): Promise<ScrapedIncident[]> {
    this.checkInitialization();

    const incidents: ScrapedIncident[] = [];
    const batchSize = 5; // Process in batches to avoid rate limits

    for (let i = 0; i < urls.length; i += batchSize) {
      const batch = urls.slice(i, i + batchSize);
      const batchPromises = batch.map(url => this.scrapeIncident(url));
      
      try {
        const batchResults = await Promise.allSettled(batchPromises);
        
        batchResults.forEach((result, index) => {
          if (result.status === 'fulfilled' && result.value) {
            incidents.push(result.value);
          } else {
            console.error('Failed to scrape URL:', batch[index], result.status === 'rejected' ? result.reason : 'No data');
          }
        });

        // Add delay between batches to respect rate limits
        if (i + batchSize < urls.length) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.error('Error in batch scraping:', error);
      }
    }

    return incidents;
  }

  private getIncidentExtractionSchema(): any {
    return {
      type: 'object',
      properties: {
        victim_name: {
          type: 'string',
          description: 'Full name of the victim of police brutality'
        },
        age: {
          type: 'number',
          description: 'Age of the victim in years'
        },
        incident_date: {
          type: 'string',
          description: 'Date when the incident occurred (YYYY-MM-DD format)'
        },
        location: {
          type: 'string',
          description: 'Specific location where the incident took place'
        },
        county: {
          type: 'string',
          description: 'Kenyan county where the incident occurred'
        },
        case_type: {
          type: 'string',
          enum: ['death', 'assault', 'harassment', 'unlawful_arrest'],
          description: 'Type of police brutality incident'
        },
        description: {
          type: 'string',
          description: 'Detailed description of what happened during the incident'
        },
        reported_by: {
          type: 'string',
          description: 'Organization or person who reported the incident'
        },
        justice_served: {
          type: 'boolean',
          description: 'Whether justice has been served or officers held accountable'
        },
        witnesses: {
          type: 'array',
          items: { type: 'string' },
          description: 'Names or descriptions of witnesses to the incident'
        },
        police_station: {
          type: 'string',
          description: 'Police station or unit involved in the incident'
        },
        officer_names: {
          type: 'array',
          items: { type: 'string' },
          description: 'Names of police officers involved if mentioned'
        }
      },
      required: ['case_type', 'description']
    };
  }

  private validateAndCleanIncident(data: any, url: string, metadata: any): ScrapedIncident | null {
    if (!data || !data.case_type || !data.description) {
      return null;
    }

    // Calculate confidence score based on available data
    const confidence = this.calculateConfidenceScore(data);

    return {
      victim_name: data.victim_name || undefined,
      age: data.age || undefined,
      incident_date: data.incident_date || undefined,
      location: data.location || undefined,
      county: data.county || undefined,
      case_type: data.case_type,
      description: data.description,
      source: metadata?.title || 'Unknown Source',
      article_url: url,
      article_title: metadata?.title || 'Unknown Title',
      published_date: metadata?.publishedTime || undefined,
      reported_by: data.reported_by || undefined,
      justice_served: data.justice_served || false,
      witnesses: data.witnesses || undefined,
      police_station: data.police_station || undefined,
      officer_names: data.officer_names || undefined,
      confidence_score: confidence,
    };
  }

  private calculateConfidenceScore(data: any): number {
    let score = 0;
    const weights = {
      victim_name: 0.2,
      age: 0.1,
      incident_date: 0.15,
      location: 0.15,
      county: 0.1,
      case_type: 0.1,
      description: 0.2,
    };

    Object.entries(weights).forEach(([field, weight]) => {
      if (data[field] && data[field].toString().trim().length > 0) {
        score += weight;
      }
    });

    return Math.round(score * 100);
  }

  private isRelevantUrl(url: string, searchTerms: string[]): boolean {
    const urlLower = url.toLowerCase();
    const relevantKeywords = [
      'police', 'brutality', 'assault', 'death', 'shooting', 'arrest',
      'harassment', 'violence', 'officer', 'cop', 'law enforcement',
      'human rights', 'justice', 'victim', 'killed', 'beaten',
      ...searchTerms.map(term => term.toLowerCase())
    ];

    return relevantKeywords.some(keyword => urlLower.includes(keyword));
  }
}

export const firecrawlService = new FirecrawlService();
export default FirecrawlService;
