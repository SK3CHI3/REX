-- Create scraping_sources table
CREATE TABLE IF NOT EXISTS scraping_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  base_url TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  last_scraped TIMESTAMP WITH TIME ZONE,
  category_urls TEXT[] DEFAULT '{}',
  search_keywords TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create scraping_jobs table
CREATE TABLE IF NOT EXISTS scraping_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES scraping_sources(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  articles_found INTEGER DEFAULT 0,
  incidents_extracted INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create scraped_articles table
CREATE TABLE IF NOT EXISTS scraped_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT UNIQUE NOT NULL,
  title TEXT,
  content TEXT,
  published_date TIMESTAMP WITH TIME ZONE,
  source_id UUID REFERENCES scraping_sources(id) ON DELETE CASCADE,
  processed BOOLEAN DEFAULT false,
  confidence_score DECIMAL(3,2),
  extracted_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default scraping sources
INSERT INTO scraping_sources (name, base_url, enabled, search_keywords) VALUES
('Daily Nation', 'https://nation.africa', true, ARRAY['police brutality', 'police violence', 'extrajudicial killing', 'unlawful arrest']),
('The Standard', 'https://standardmedia.co.ke', true, ARRAY['police brutality', 'police violence', 'extrajudicial killing', 'unlawful arrest']),
('Citizen Digital', 'https://citizentv.co.ke', true, ARRAY['police brutality', 'police violence', 'extrajudicial killing', 'unlawful arrest']),
('Kenya Human Rights Commission', 'https://khrc.or.ke', true, ARRAY['police brutality', 'police violence', 'human rights violation'])
ON CONFLICT (name) DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_status ON scraping_jobs(status);
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_source_id ON scraping_jobs(source_id);
CREATE INDEX IF NOT EXISTS idx_scraped_articles_url ON scraped_articles(url);
CREATE INDEX IF NOT EXISTS idx_scraped_articles_processed ON scraped_articles(processed);
CREATE INDEX IF NOT EXISTS idx_scraped_articles_source_id ON scraped_articles(source_id);

-- Enable RLS
ALTER TABLE scraping_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraping_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraped_articles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow authenticated read access to scraping_sources" ON scraping_sources
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow service role full access to scraping_sources" ON scraping_sources
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Allow authenticated read access to scraping_jobs" ON scraping_jobs
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow service role full access to scraping_jobs" ON scraping_jobs
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Allow authenticated read access to scraped_articles" ON scraped_articles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow service role full access to scraped_articles" ON scraped_articles
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_scraping_sources_updated_at
  BEFORE UPDATE ON scraping_sources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
