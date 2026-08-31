-- Migration: align schema with the n8n "Weekly Case Scraper + AI Digest" workflow
-- Import file: n8n/weekly-case-scraper.json
-- Adds the columns the workflow inserts, creates the news_articles table for the
-- weekly AI digest, and protects the URL dedupe history used by the workflow.

-- ============================================================================
-- 1. scraped_articles: workflow logs processed_at and case_created
-- ============================================================================
ALTER TABLE public.scraped_articles
  ADD COLUMN IF NOT EXISTS processed_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS case_created BOOLEAN DEFAULT false;

-- ============================================================================
-- 2. case_submissions: workflow inserts title / severity / source_url
-- ============================================================================
ALTER TABLE public.case_submissions
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS severity TEXT,
  ADD COLUMN IF NOT EXISTS source_url TEXT;

COMMENT ON COLUMN public.case_submissions.source_url IS 'URL of the news article a scraped case was extracted from';
COMMENT ON COLUMN public.case_submissions.severity IS 'AI-assessed severity (low/medium/high/critical), scraper submissions only';

CREATE INDEX IF NOT EXISTS idx_case_submissions_source_url ON public.case_submissions (source_url);

-- The workflow never sends case_type; keep inserts from failing on it.
-- (Safe no-op if the column is already nullable.)
ALTER TABLE public.case_submissions ALTER COLUMN case_type DROP NOT NULL;

-- ============================================================================
-- 3. scraping_jobs: workflow inserts source_name / new_articles / errors / run_at
--    and never sends status, which is NOT NULL. A default keeps those inserts
--    valid and keeps get_scraping_stats() counting them.
-- ============================================================================
ALTER TABLE public.scraping_jobs
  ADD COLUMN IF NOT EXISTS source_name TEXT,
  ADD COLUMN IF NOT EXISTS new_articles INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS errors INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS run_at TIMESTAMP WITH TIME ZONE DEFAULT now();

ALTER TABLE public.scraping_jobs ALTER COLUMN status SET DEFAULT 'completed';

-- ============================================================================
-- 4. news_articles: destination for the weekly AI digest
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.news_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  summary TEXT,
  body TEXT NOT NULL,
  category TEXT,
  ai_generated BOOLEAN DEFAULT false,
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_news_articles_published ON public.news_articles (published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_articles_category ON public.news_articles (category);

ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to published news_articles" ON public.news_articles
  FOR SELECT USING (published = true OR auth.role() = 'authenticated');

CREATE POLICY "Allow service role full access to news_articles" ON public.news_articles
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_news_articles_updated_at
  BEFORE UPDATE ON public.news_articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 5. Protect the dedupe history
-- ============================================================================
-- The workflow dedupes against the FULL scraped_articles history, but the
-- cleanup cron from setup_scraping_cron.sql deletes rows older than 7 days,
-- which would silently cause articles to be re-scraped every week. Replace it
-- with a version that keeps URLs forever and only strips bulky content.
-- Also unschedule the stale 6-hourly job that points at a removed edge
-- function (guarded: no-op if it was never scheduled).

DO $$
BEGIN
  PERFORM cron.unschedule('scrape-police-incidents');
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

CREATE OR REPLACE FUNCTION cleanup_old_scraping_data()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_jobs integer;
  trimmed_articles integer;
  result json;
BEGIN
  -- Delete scraping jobs older than 30 days
  DELETE FROM scraping_jobs
  WHERE created_at < now() - interval '30 days'
  AND status IN ('completed', 'failed');

  GET DIAGNOSTICS deleted_jobs = ROW_COUNT;

  -- Keep scraped_articles rows (URL dedupe history) but drop bulky payloads
  UPDATE scraped_articles
  SET content = NULL, extracted_data = NULL
  WHERE created_at < now() - interval '30 days'
  AND content IS NOT NULL;

  GET DIAGNOSTICS trimmed_articles = ROW_COUNT;

  result := json_build_object(
    'success', true,
    'deleted_jobs', deleted_jobs,
    'trimmed_articles', trimmed_articles,
    'cleanup_time', now()
  );

  RETURN result;
END;
$$;
