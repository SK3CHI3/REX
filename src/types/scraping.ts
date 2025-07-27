export interface ScrapedIncident {
  victim_name?: string;
  age?: number;
  incident_date?: string;
  location?: string;
  county?: string;
  case_type: 'death' | 'assault' | 'harassment' | 'unlawful_arrest';
  description: string;
  source: string;
  article_url: string;
  article_title: string;
  published_date?: string;
  reported_by?: string;
  justice_served?: boolean;
  witnesses?: string[];
  police_station?: string;
  officer_names?: string[];
  confidence_score?: number;
}

export interface ScrapingSource {
  id: string;
  name: string;
  base_url: string;
  search_urls: string[];
  category_urls: string[];
  enabled: boolean;
  last_scraped?: string;
  scraping_interval_hours: number;
}

export interface ScrapingJob {
  id: string;
  source_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  started_at: string;
  completed_at?: string;
  articles_found: number;
  incidents_extracted: number;
  error_message?: string;
  urls_scraped: string[];
}

export interface ScrapedArticle {
  id: string;
  job_id: string;
  url: string;
  title: string;
  content: string;
  published_date?: string;
  author?: string;
  processed: boolean;
  incidents_extracted: number;
  created_at: string;
}

export interface ExtractionSchema {
  victim_name?: {
    type: 'string';
    description: 'Full name of the victim of police brutality';
  };
  age?: {
    type: 'number';
    description: 'Age of the victim in years';
  };
  incident_date?: {
    type: 'string';
    description: 'Date when the incident occurred (YYYY-MM-DD format)';
  };
  location?: {
    type: 'string';
    description: 'Specific location where the incident took place';
  };
  county?: {
    type: 'string';
    description: 'Kenyan county where the incident occurred';
  };
  case_type: {
    type: 'string';
    enum: ['death', 'assault', 'harassment', 'unlawful_arrest'];
    description: 'Type of police brutality incident';
  };
  description: {
    type: 'string';
    description: 'Detailed description of what happened during the incident';
  };
  reported_by?: {
    type: 'string';
    description: 'Organization or person who reported the incident';
  };
  justice_served?: {
    type: 'boolean';
    description: 'Whether justice has been served or officers held accountable';
  };
  witnesses?: {
    type: 'array';
    items: { type: 'string' };
    description: 'Names or descriptions of witnesses to the incident';
  };
  police_station?: {
    type: 'string';
    description: 'Police station or unit involved in the incident';
  };
  officer_names?: {
    type: 'array';
    items: { type: 'string' };
    description: 'Names of police officers involved if mentioned';
  };
}

export interface ScrapingConfig {
  max_concurrent_jobs: number;
  default_scraping_interval_hours: number;
  max_articles_per_job: number;
  extraction_confidence_threshold: number;
  duplicate_detection_enabled: boolean;
  auto_approve_high_confidence: boolean;
  high_confidence_threshold: number;
}

export interface ScrapingStats {
  total_jobs: number;
  successful_jobs: number;
  failed_jobs: number;
  total_articles_scraped: number;
  total_incidents_extracted: number;
  last_successful_scrape: string;
  sources_status: {
    source_id: string;
    source_name: string;
    last_scraped: string;
    status: 'active' | 'error' | 'disabled';
    error_message?: string;
  }[];
}
