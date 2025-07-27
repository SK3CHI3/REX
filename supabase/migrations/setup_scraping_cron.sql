-- Enable the pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create a function to call our Edge Function
CREATE OR REPLACE FUNCTION trigger_scraping_job()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Call the Edge Function using HTTP
  PERFORM
    net.http_post(
      url := current_setting('app.supabase_url') || '/functions/v1/schedule-scraping',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.service_role_key')
      ),
      body := jsonb_build_object('scheduled', true)
    );
END;
$$;

-- Schedule the scraping job to run every 6 hours
-- This will run at: 00:00, 06:00, 12:00, 18:00 daily
SELECT cron.schedule(
  'scrape-police-incidents',
  '0 */6 * * *',
  'SELECT trigger_scraping_job();'
);

-- Create a function to manually trigger scraping
CREATE OR REPLACE FUNCTION manual_trigger_scraping()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  -- Call the scraping function
  SELECT trigger_scraping_job();
  
  -- Return success message
  result := json_build_object(
    'success', true,
    'message', 'Manual scraping job triggered',
    'timestamp', now()
  );
  
  RETURN result;
END;
$$;

-- Create a function to get scraping statistics
CREATE OR REPLACE FUNCTION get_scraping_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  stats json;
BEGIN
  SELECT json_build_object(
    'total_jobs', (SELECT COUNT(*) FROM scraping_jobs),
    'successful_jobs', (SELECT COUNT(*) FROM scraping_jobs WHERE status = 'completed'),
    'failed_jobs', (SELECT COUNT(*) FROM scraping_jobs WHERE status = 'failed'),
    'running_jobs', (SELECT COUNT(*) FROM scraping_jobs WHERE status = 'running'),
    'total_articles', (SELECT COALESCE(SUM(articles_found), 0) FROM scraping_jobs),
    'total_incidents', (SELECT COALESCE(SUM(incidents_extracted), 0) FROM scraping_jobs),
    'pending_reviews', (SELECT COUNT(*) FROM case_submissions WHERE status = 'pending' AND reporter_name = 'Automated Scraper'),
    'last_job_time', (SELECT MAX(created_at) FROM scraping_jobs),
    'sources_status', (
      SELECT json_agg(
        json_build_object(
          'source_id', id,
          'source_name', name,
          'enabled', enabled,
          'last_scraped', last_scraped,
          'base_url', base_url
        )
      )
      FROM scraping_sources
    )
  ) INTO stats;
  
  RETURN stats;
END;
$$;

-- Create a function to enable/disable scraping sources
CREATE OR REPLACE FUNCTION toggle_scraping_source(source_id uuid, enable_source boolean)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
  source_name text;
BEGIN
  -- Update the source
  UPDATE scraping_sources 
  SET enabled = enable_source, updated_at = now()
  WHERE id = source_id
  RETURNING name INTO source_name;
  
  IF FOUND THEN
    result := json_build_object(
      'success', true,
      'message', 'Source ' || source_name || ' ' || CASE WHEN enable_source THEN 'enabled' ELSE 'disabled' END,
      'source_id', source_id,
      'enabled', enable_source
    );
  ELSE
    result := json_build_object(
      'success', false,
      'message', 'Source not found',
      'source_id', source_id
    );
  END IF;
  
  RETURN result;
END;
$$;

-- Create a function to clean up old scraping data
CREATE OR REPLACE FUNCTION cleanup_old_scraping_data()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_jobs integer;
  deleted_articles integer;
  result json;
BEGIN
  -- Delete scraping jobs older than 30 days
  DELETE FROM scraping_jobs 
  WHERE created_at < now() - interval '30 days'
  AND status IN ('completed', 'failed');
  
  GET DIAGNOSTICS deleted_jobs = ROW_COUNT;
  
  -- Delete processed scraped articles older than 7 days
  DELETE FROM scraped_articles 
  WHERE created_at < now() - interval '7 days'
  AND processed = true;
  
  GET DIAGNOSTICS deleted_articles = ROW_COUNT;
  
  result := json_build_object(
    'success', true,
    'deleted_jobs', deleted_jobs,
    'deleted_articles', deleted_articles,
    'cleanup_time', now()
  );
  
  RETURN result;
END;
$$;

-- Schedule weekly cleanup (every Sunday at 2 AM)
SELECT cron.schedule(
  'cleanup-scraping-data',
  '0 2 * * 0',
  'SELECT cleanup_old_scraping_data();'
);

-- Create RLS policies for scraping tables
ALTER TABLE scraping_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraping_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraped_articles ENABLE ROW LEVEL SECURITY;

-- Allow read access to scraping data for authenticated users
CREATE POLICY "Allow read access to scraping sources" ON scraping_sources
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow read access to scraping jobs" ON scraping_jobs
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow read access to scraped articles" ON scraped_articles
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow service role to manage all scraping data
CREATE POLICY "Service role can manage scraping sources" ON scraping_sources
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage scraping jobs" ON scraping_jobs
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage scraped articles" ON scraped_articles
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_created_at ON scraping_jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_source_status ON scraping_jobs(source_id, status);
CREATE INDEX IF NOT EXISTS idx_scraped_articles_created_at ON scraped_articles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scraped_articles_processed ON scraped_articles(processed, created_at);

-- Insert a log entry to confirm setup
INSERT INTO scraping_jobs (source_id, status, started_at, completed_at, articles_found, incidents_extracted, error_message)
VALUES (
  (SELECT id FROM scraping_sources LIMIT 1),
  'completed',
  now(),
  now(),
  0,
  0,
  'Setup completed - cron jobs scheduled'
);

-- Display current cron jobs
SELECT * FROM cron.job;
