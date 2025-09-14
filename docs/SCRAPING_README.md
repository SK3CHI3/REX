# Kenya Police Brutality Tracker - Automated Scraping System

This document describes the automated web scraping system that monitors Kenyan news sources for police brutality incidents and extracts structured data using AI-powered analysis.

## 🔥 Features

- **Automated Monitoring**: Continuously monitors major Kenyan news sources
- **AI-Powered Extraction**: Uses Firecrawl's AI to extract structured incident data
- **Duplicate Detection**: Prevents duplicate entries in the database
- **Confidence Scoring**: Assigns confidence scores to extracted data
- **Manual Review**: High-confidence incidents are auto-approved, others require review
- **Real-time Dashboard**: Web interface to monitor scraping progress
- **Scheduled Jobs**: Runs automatically every 6 hours

## 🏗️ Architecture

```
src/services/
├── firecrawl.ts          # Firecrawl API integration
├── scraping/
│   └── index.ts          # Main scraping orchestrator
├── scheduler.ts          # Cron job scheduler
└── scraping-api.ts       # API functions for frontend

src/hooks/
└── useScraping.ts        # React hooks for scraping data

src/components/
└── ScrapingDashboard.tsx # Admin dashboard component

scripts/
├── start-scraper.js      # Service management script
└── test-firecrawl.js     # Integration test script
```

## 📊 Database Schema

### New Tables Created:

1. **scraping_sources** - Configuration for news sources
2. **scraping_jobs** - Track scraping job execution
3. **scraped_articles** - Store scraped article metadata
4. **case_submissions** - Pending cases for review

### Enhanced Tables:

- **cases** - Added scraping-related fields:
  - `scraped_from_url`
  - `scraping_job_id`
  - `confidence_score`
  - `auto_approved`

## 🎯 Monitored Sources

The system monitors these Kenyan news sources:

1. **Daily Nation** (nation.africa)
2. **The Standard** (standardmedia.co.ke)
3. **Citizen Digital** (citizen.digital)
4. **Kenya Human Rights Commission** (khrc.or.ke)
5. **Capital News** (capitalfm.co.ke)

## 🚀 Getting Started

### Prerequisites

1. **Firecrawl API Key**: Get from [firecrawl.dev](https://firecrawl.dev)
2. **Supabase Project**: Already configured
3. **Node.js**: Version 18+ required

### Setup

1. **Configure API Key**:
   ```bash
   # Update .env.local
   FIRECRAWL_API_KEY=fc-4560b05189614f5f815a46cc1d8e116c
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Test Integration**:
   ```bash
   node scripts/test-firecrawl.js
   ```

### Running the Scraper

#### Start the Service:
```bash
npm run scraper:start
```

#### Check Status:
```bash
npm run scraper:status
```

#### Stop the Service:
```bash
npm run scraper:stop
```

#### Test Configuration:
```bash
npm run scraper:test
```

## 📱 Dashboard Access

Visit the admin dashboard at:
```
http://localhost:8080/admin/scraping
```

The dashboard provides:
- Real-time scraping status
- Job history and statistics
- Source configuration management
- Pending case reviews
- Performance metrics

## 🔄 How It Works

### 1. Scheduled Monitoring
- Runs every 6 hours automatically
- Can be triggered manually via dashboard
- Monitors all enabled news sources

### 2. Content Discovery
- **Search**: Uses Firecrawl search with Kenya-specific queries
- **Crawling**: Maps news websites for relevant articles
- **Filtering**: Identifies URLs likely to contain police brutality content

### 3. Data Extraction
- **AI Analysis**: Firecrawl AI extracts structured data using predefined schema
- **Validation**: Validates and cleans extracted data
- **Confidence Scoring**: Assigns scores based on data completeness

### 4. Storage & Review
- **High Confidence (≥80%)**: Auto-approved and added to cases
- **Lower Confidence**: Stored for manual review
- **Duplicate Detection**: Prevents duplicate entries

## 📋 Data Schema

The AI extracts the following fields:

```typescript
interface ScrapedIncident {
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
  confidence_score: number;
}
```

## 🔧 Configuration

### Source Configuration
Each source can be configured with:
- **Base URL**: Main website URL
- **Search URLs**: Specific search endpoints
- **Category URLs**: News category pages
- **Scraping Interval**: How often to scrape (hours)
- **Enabled/Disabled**: Toggle source on/off

### Scheduler Configuration
- **Main Scraping**: Every 6 hours
- **Daily Stats**: Midnight daily
- **Weekly Cleanup**: Sunday 2 AM

## 📊 Monitoring & Metrics

### Key Metrics Tracked:
- Total scraping jobs executed
- Success/failure rates
- Articles scraped per source
- Incidents extracted
- Confidence score distributions
- Processing times

### Logs & Debugging:
- Detailed console logging
- Error tracking and reporting
- Performance monitoring
- Status reports every hour

## 🛡️ Security & Ethics

### Data Privacy:
- Only extracts publicly available news content
- Respects robots.txt and rate limits
- No personal data collection beyond news reports

### Rate Limiting:
- 2-second delays between batch requests
- Maximum 50 URLs per scraping job
- Respects source server capacity

### Content Validation:
- Manual review for sensitive content
- Confidence scoring prevents false positives
- Human oversight for all auto-approved cases

## 🔍 Troubleshooting

### Common Issues:

1. **API Key Errors**:
   ```bash
   # Verify API key is set correctly
   echo $FIRECRAWL_API_KEY
   ```

2. **Database Connection**:
   ```bash
   # Check Supabase configuration
   echo $VITE_SUPABASE_URL
   ```

3. **Scraping Failures**:
   - Check network connectivity
   - Verify source websites are accessible
   - Review Firecrawl API limits

### Debug Mode:
```bash
# Run with detailed logging
DEBUG=* npm run scraper:start
```

## 📈 Performance Optimization

### Current Limits:
- 5 concurrent requests per batch
- 50 URLs maximum per job
- 30-second timeout per request

### Scaling Considerations:
- Increase batch size for faster processing
- Add more news sources
- Implement distributed processing
- Cache frequently accessed data

## 🔄 Maintenance

### Regular Tasks:
- Monitor scraping success rates
- Review and approve pending cases
- Update source configurations
- Clean up old scraping data (automated)

### Weekly Review:
- Check source performance
- Analyze confidence score trends
- Update search terms if needed
- Review false positives/negatives

## 📞 Support

For issues or questions:
1. Check the dashboard for error messages
2. Review console logs for detailed errors
3. Test individual components with test scripts
4. Verify API keys and database connections

---

**Note**: This system is designed to assist human researchers and journalists in tracking police brutality incidents. All extracted data should be verified before publication or legal action.
