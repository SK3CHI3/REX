# Weekly Case Scraper + AI Digest (n8n + Apify)

Automated pipeline that discovers Kenyan news articles about police brutality,
extracts structured cases with AI, stores them for admin review, and publishes a
weekly AI-written digest article.

Import file: `n8n/weekly-case-scraper.json`

## Architecture

```
Schedule (Mon 06:00) / Manual Test Run
  -> Set Run Config            (budget caps from env vars)
  -> Get Scraped URLs          (dedupe cache in workflow static data)
  -> Get Enabled Sources       (scraping_sources where enabled=true)
  -> Loop Over Sources
       Build Apify Request -> Run Apify Scraper (cheerio-scraper, sync HTTP)
       -> Filter & Track New URLs (per-source + per-run caps)
  -> Loop Over New Articles
       AI Agent + Gemini + structured parser -> is it a case?
       yes -> Map Case Fields -> Insert Case Submission (status=pending)
       -> Log Scraped Article (url, source_id, processed_at, case_created)
  -> Build/Insert Job Stats    (scraping_jobs, one row per source)
  -> Get cases from last 7 days
       any? -> AI Agent writes digest -> Insert into news_articles (published)
       none -> No Cases This Week
```

Nothing is ever auto-published as a case. Scraped cases wait in the admin
dashboard review queue, exactly like community submissions.

## Required on the n8n instance

Credentials (created in n8n -> Credentials):

- `Supabase account` — Supabase API credential with the **service role key**
  (writes bypass RLS; keep it secret).
- `Google Gemini account` — Google AI Studio API key (free tier works).

Environment variables:

| Variable | Purpose |
| --- | --- |
| `APIFY_API_TOKEN` | Your Apify account token (free plan includes $5/month credit) |

Optional budget knobs:

| Variable | Default | Meaning |
| --- | --- | --- |
| `MAX_PAGES_PER_SOURCE` | 8 | Max pages Apify may fetch per source per run |
| `MAX_NEW_PER_SOURCE` | 12 | Max new articles processed per source per run |
| `MAX_NEW_TOTAL` | 40 | Hard cap of new articles per run (budget guard) |

## Setup

1. Run n8n anywhere (local Docker, `npx n8n`, or a VPS) and set `APIFY_API_TOKEN`.
2. Create the two credentials above, then import `n8n/weekly-case-scraper.json`
   (Workflows -> Import from File) and re-select both credentials on the nodes.
3. Apply the database migration `supabase/migrations/20260831_scraper_workflow_schema.sql`
   (adds the columns the workflow writes and creates `news_articles`).
4. Press "Manual Test Run" once to verify credentials end to end, then activate
   the workflow so the Monday 06:00 schedule runs.

Apify needs no setup beyond the token: the workflow calls the rented
`apify/cheerio-scraper` actor, so there is nothing to deploy on Apify.

## Staying under the $5 Apify credit

- Cheerio Scraper uses plain HTTP (no headless browser), the cheapest option.
- Each run is capped: 8 pages/source, further limited by `MAX_NEW_TOTAL`.
- One run per week. Typical cost is a few cents per month.
- Also set a budget alert in the Apify console (Settings -> Billing) as a backstop.
- Gemini runs on the free tier; n8n self-hosted costs nothing.

## Managing sources

Edit rows in the `scraping_sources` table:

- `enabled` toggles a source on/off
- `category_urls` are the listing pages crawled for article discovery
  (falls back to `base_url` when empty)

## Monitoring

- `scraping_jobs`: one row per source per run (`source_name`, `articles_found`,
  `new_articles`, `errors`, `run_at`).
- `scraped_articles`: every URL ever processed (dedupe store; URLs are kept
  forever, bulky content is trimmed after 30 days by the cleanup cron).
- `case_submissions` with `reporter_name = 'Automated Scraper'`: review queue
  (scraped rows carry `title`, `severity`, `source_url`).
- `news_articles`: weekly AI digests (`published = true`, `ai_generated = true`).

## Known frontend gaps

The digest lands in `news_articles`, which the site does not render yet
(the News section reads the older `news` table), and the admin review screen
does not display the new `title` / `severity` / `source_url` fields. Scraped
cases also carry no `case_type` or coordinates until an editor fills them in.
