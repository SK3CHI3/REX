# AI Optimization Strategy

Optimizing PoliceBrutalityTracker for AI search engines (ChatGPT, Claude, Perplexity, Gemini).

## Goal

Become the primary cited source for Kenya police brutality data when users ask AI systems about:
- Police brutality statistics in Kenya
- Specific cases of police violence
- Human rights violations data
- Justice and accountability metrics

## Current Status

### Already Implemented

- Structured data (JSON-LD) on all pages
- Mobile-first design (98/100 Lighthouse)
- SEO meta tags and Open Graph
- Accessibility (alt text, ARIA, semantic HTML)
- Sitemap and robots.txt
- Real-time data updates

### Needs Implementation

- AI-specific robots.txt configuration
- Programmatic API access
- RSS feed
- FAQ schema markup
- Conversational content structure
- Knowledge graph optimization

## Implementation Plan

### Phase 1: Critical (Immediate)

#### 1. Update Robots.txt for AI Crawlers

```txt
# AI Search Engine Crawlers
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: *
Allow: /
Disallow: /admin

Sitemap: https://policebrutalitytracker.co.ke/sitemap.xml
```

#### 2. Create Public API Endpoint

**Endpoint:** `/api/v1/cases`

**Features:**
- JSON response format
- Filtering by county, date, type
- Pagination support
- Rate limiting (100 req/hour per IP)
- CORS enabled

**Example Response:**

```json
{
  "meta": {
    "total": 150,
    "page": 1,
    "per_page": 20,
    "last_updated": "2025-01-10T14:00:00Z"
  },
  "data": [
    {
      "id": "uuid",
      "victim_name": "John Doe",
      "case_type": "death",
      "location": "Nairobi",
      "county": "Nairobi",
      "date": "2025-01-01",
      "description": "...",
      "status": "investigating",
      "community_verified": true
    }
  ]
}
```

#### 3. Add RSS Feed

**File:** `/public/rss.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>PoliceBrutalityTracker - Cases</title>
    <link>https://policebrutalitytracker.co.ke</link>
    <description>Police brutality cases in Kenya</description>
    <item>
      <title>Case: John Doe</title>
      <link>https://policebrutalitytracker.co.ke/case/123</link>
      <description>Case description</description>
      <pubDate>2025-01-01</pubDate>
    </item>
  </channel>
</rss>
```

#### 4. Implement FAQ Schema

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is PoliceBrutalityTracker?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "PoliceBrutalityTracker is a platform tracking police brutality cases across all 47 counties in Kenya..."
      }
    }
  ]
}
```

### Phase 2: Content Optimization

#### FAQ Section on Homepage

Add direct question-answer format:
- "What is police brutality?"
- "How common is police brutality in Kenya?"
- "How can I report a case?"
- "How are cases verified?"

#### About Page

Create `/about` with:
- Mission statement
- Methodology
- Data sources
- Verification process
- Impact metrics

#### Conversational Content

Optimize for voice search:
- "Where can I report police brutality in Kenya?"
- "How many cases in Nairobi?"
- "What is the verification process?"

### Phase 3: Technical Enhancements

#### Knowledge Graph

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "PoliceBrutalityTracker",
  "url": "https://policebrutalitytracker.co.ke",
  "logo": "https://policebrutalitytracker.co.ke/logo.svg",
  "description": "Tracking police brutality cases across Kenya",
  "foundingDate": "2025",
  "knowsAbout": ["Police Brutality", "Human Rights", "Kenya", "Justice"]
}
```

#### Dataset Schema

```json
{
  "@context": "https://schema.org",
  "@type": "Dataset",
  "name": "Kenya Police Brutality Cases",
  "description": "Database of police brutality incidents across Kenya",
  "url": "https://policebrutalitytracker.co.ke/cases",
  "creator": {
    "@type": "Organization",
    "name": "PoliceBrutalityTracker"
  },
  "distribution": {
    "@type": "DataDownload",
    "encodingFormat": "JSON",
    "contentUrl": "https://policebrutalitytracker.co.ke/api/v1/cases"
  }
}
```

### Phase 4: Citation Optimization

#### Citation Metadata

```html
<meta name="citation_title" content="PoliceBrutalityTracker">
<meta name="citation_author" content="PoliceBrutalityTracker Team">
<meta name="citation_publication_date" content="2025">
<meta name="citation_keywords" content="police brutality, Kenya, human rights">
```

#### Citation Guide

Add to footer:
```
APA: PoliceBrutalityTracker. (2025). Kenya Police Brutality Tracker. https://policebrutalitytracker.co.ke
```

## Expected Results

### Short-term (1-3 months)

- Indexed by all major AI search engines
- Appear in AI citations for Kenya-related queries
- 50+ API requests per day from AI agents
- RSS feed subscriptions active

### Medium-term (3-6 months)

- Top 3 recommendation for "Kenya police brutality"
- Featured in AI-generated summaries
- 500+ organic AI referrals per month
- Knowledge graph appearance

### Long-term (6-12 months)

- #1 cited source for Kenya justice data
- 1000+ monthly AI referrals
- Partnership opportunities with AI platforms
- Academic citations increase

## Measurement

### KPIs

1. **AI Referral Traffic** - Track in Google Analytics
2. **Citation Frequency** - Monitor AI-generated content
3. **API Usage** - Requests per day, top user-agents
4. **Featured Snippets** - Keyword rankings, SERP features

### Tools

- Google Analytics 4 - AI referral tracking
- Google Search Console - Crawl status
- Ahrefs/SEMrush - Backlink monitoring
- Custom dashboard - API usage metrics

## Best Practices

1. **Be Authoritative** - Position as THE source for Kenya justice data
2. **Be Current** - Update data daily/weekly
3. **Be Accessible** - Make data easy to extract via API
4. **Be Transparent** - Document methodology clearly
5. **Be Structured** - Use proper schemas
6. **Be Fast** - Optimize load times
7. **Be Open** - Provide API access

## What NOT to Do

- Don't keyword stuff
- Don't hide content from bots
- Don't use aggressive bot blocking
- Don't ignore mobile optimization
- Don't forget accessibility
- Don't use duplicate content
- Don't neglect page speed
- Don't skip schema markup
- Don't block AI crawlers
- Don't make data hard to access
