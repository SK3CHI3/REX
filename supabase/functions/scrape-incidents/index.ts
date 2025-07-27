import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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
  confidence_score: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Initialize Firecrawl
    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY')
    if (!firecrawlApiKey) {
      throw new Error('FIRECRAWL_API_KEY not configured')
    }

    console.log('🔥 Starting Kenya Police Brutality Scraping Job')

    // Get enabled scraping sources
    const { data: sources, error: sourcesError } = await supabaseClient
      .from('scraping_sources')
      .select('*')
      .eq('enabled', true)

    if (sourcesError) {
      throw new Error(`Failed to fetch sources: ${sourcesError.message}`)
    }

    console.log(`📊 Found ${sources?.length || 0} enabled sources`)

    let totalArticles = 0
    let totalIncidents = 0

    // Process each source
    for (const source of sources || []) {
      try {
        console.log(`🔍 Processing source: ${source.name}`)

        // Create scraping job record
        const { data: job, error: jobError } = await supabaseClient
          .from('scraping_jobs')
          .insert({
            source_id: source.id,
            status: 'running'
          })
          .select()
          .single()

        if (jobError) {
          console.error(`Failed to create job for ${source.name}:`, jobError)
          continue
        }

        // Search for police brutality incidents
        const searchQueries = [
          'police brutality Kenya',
          'police violence Kenya', 
          'extrajudicial killing Kenya',
          'police shooting Kenya',
          'unlawful arrest Kenya'
        ]

        const foundUrls = new Set<string>()

        // Use Firecrawl search for each query
        for (const query of searchQueries) {
          try {
            const searchResponse = await fetch('https://api.firecrawl.dev/v0/search', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${firecrawlApiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                query: query,
                limit: 10,
                country: 'KE'
              })
            })

            if (searchResponse.ok) {
              const searchData = await searchResponse.json()
              if (searchData.success && searchData.data) {
                searchData.data.forEach((result: any) => {
                  if (result.url && isRelevantUrl(result.url, source.base_url)) {
                    foundUrls.add(result.url)
                  }
                })
              }
            }
          } catch (error) {
            console.error(`Search failed for query "${query}":`, error)
          }
        }

        console.log(`📄 Found ${foundUrls.size} URLs for ${source.name}`)

        // Check for existing articles to avoid duplicates
        const urlsArray = Array.from(foundUrls)
        const { data: existingArticles } = await supabaseClient
          .from('scraped_articles')
          .select('url')
          .in('url', urlsArray)

        const existingUrls = new Set(existingArticles?.map(a => a.url) || [])
        const newUrls = urlsArray.filter(url => !existingUrls.has(url))

        console.log(`🆕 ${newUrls.length} new URLs to process`)

        // Process new URLs (limit to 20 per run)
        const urlsToProcess = newUrls.slice(0, 20)
        let articlesProcessed = 0
        let incidentsExtracted = 0

        for (const url of urlsToProcess) {
          try {
            // Scrape and extract incident data
            const incident = await scrapeIncident(url, firecrawlApiKey)
            
            if (incident) {
              // Store article
              await supabaseClient
                .from('scraped_articles')
                .insert({
                  job_id: job.id,
                  url: url,
                  title: incident.article_title,
                  content: incident.description,
                  published_date: incident.published_date,
                  processed: true,
                  incidents_extracted: 1
                })

              articlesProcessed++

              // Check for duplicates
              const isDuplicate = await checkForDuplicate(supabaseClient, incident)
              
              if (!isDuplicate) {
                // Store for review
                await storeIncidentForReview(supabaseClient, incident, job.id)
                incidentsExtracted++
              }
            } else {
              // Store article even if no incident found
              await supabaseClient
                .from('scraped_articles')
                .insert({
                  job_id: job.id,
                  url: url,
                  processed: true,
                  incidents_extracted: 0
                })
              articlesProcessed++
            }

          } catch (error) {
            console.error(`Error processing URL ${url}:`, error)
          }
        }

        // Update job completion
        await supabaseClient
          .from('scraping_jobs')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            articles_found: articlesProcessed,
            incidents_extracted: incidentsExtracted,
            urls_scraped: urlsToProcess
          })
          .eq('id', job.id)

        // Update source last_scraped
        await supabaseClient
          .from('scraping_sources')
          .update({ last_scraped: new Date().toISOString() })
          .eq('id', source.id)

        totalArticles += articlesProcessed
        totalIncidents += incidentsExtracted

        console.log(`✅ Completed ${source.name}: ${articlesProcessed} articles, ${incidentsExtracted} incidents`)

      } catch (error) {
        console.error(`Error processing source ${source.name}:`, error)
        
        // Mark job as failed
        await supabaseClient
          .from('scraping_jobs')
          .update({
            status: 'failed',
            completed_at: new Date().toISOString(),
            error_message: error.message
          })
          .eq('source_id', source.id)
          .eq('status', 'running')
      }
    }

    const result = {
      success: true,
      message: `Scraping completed successfully`,
      stats: {
        sources_processed: sources?.length || 0,
        total_articles: totalArticles,
        total_incidents: totalIncidents,
        timestamp: new Date().toISOString()
      }
    }

    console.log('🎉 Scraping job completed:', result)

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('❌ Scraping job failed:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

async function scrapeIncident(url: string, apiKey: string): Promise<ScrapedIncident | null> {
  try {
    const response = await fetch('https://api.firecrawl.dev/v0/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url,
        formats: ['markdown'],
        extractorOptions: {
          mode: 'llm-extraction',
          extractionPrompt: `Extract police brutality incident information from this article. Return JSON with:
          - victim_name: string (full name of victim)
          - age: number (age in years)
          - incident_date: string (YYYY-MM-DD format)
          - location: string (specific location)
          - county: string (Kenyan county)
          - case_type: "death" | "assault" | "harassment" | "unlawful_arrest"
          - description: string (detailed description)
          - justice_served: boolean
          - police_station: string
          - officer_names: array of strings
          Only extract if this is clearly about police brutality in Kenya.`,
          extractionSchema: {
            type: 'object',
            properties: {
              victim_name: { type: 'string' },
              age: { type: 'number' },
              incident_date: { type: 'string' },
              location: { type: 'string' },
              county: { type: 'string' },
              case_type: { 
                type: 'string',
                enum: ['death', 'assault', 'harassment', 'unlawful_arrest']
              },
              description: { type: 'string' },
              justice_served: { type: 'boolean' },
              police_station: { type: 'string' },
              officer_names: { type: 'array', items: { type: 'string' } }
            },
            required: ['case_type', 'description']
          }
        },
        timeout: 30000
      })
    })

    if (!response.ok) {
      console.error(`Scraping failed for ${url}: ${response.status}`)
      return null
    }

    const data = await response.json()
    
    if (!data.success || !data.data?.llm_extraction) {
      return null
    }

    const extracted = data.data.llm_extraction
    
    // Validate required fields
    if (!extracted.case_type || !extracted.description) {
      return null
    }

    // Calculate confidence score
    const confidence = calculateConfidenceScore(extracted)

    return {
      victim_name: extracted.victim_name,
      age: extracted.age,
      incident_date: extracted.incident_date,
      location: extracted.location,
      county: extracted.county,
      case_type: extracted.case_type,
      description: extracted.description,
      source: data.data.metadata?.title || 'Unknown Source',
      article_url: url,
      article_title: data.data.metadata?.title || 'Unknown Title',
      published_date: data.data.metadata?.publishedTime,
      confidence_score: confidence
    }

  } catch (error) {
    console.error(`Error scraping ${url}:`, error)
    return null
  }
}

function calculateConfidenceScore(data: any): number {
  let score = 0
  const weights = {
    victim_name: 0.2,
    age: 0.1,
    incident_date: 0.15,
    location: 0.15,
    county: 0.1,
    case_type: 0.1,
    description: 0.2,
  }

  Object.entries(weights).forEach(([field, weight]) => {
    if (data[field] && data[field].toString().trim().length > 0) {
      score += weight
    }
  })

  return Math.round(score * 100)
}

function isRelevantUrl(url: string, baseUrl: string): boolean {
  const urlLower = url.toLowerCase()
  const relevantKeywords = [
    'police', 'brutality', 'assault', 'death', 'shooting', 'arrest',
    'harassment', 'violence', 'officer', 'cop', 'law enforcement',
    'human rights', 'justice', 'victim', 'killed', 'beaten'
  ]

  return relevantKeywords.some(keyword => urlLower.includes(keyword)) &&
         url.includes(baseUrl.replace('https://', '').replace('http://', ''))
}

async function checkForDuplicate(supabaseClient: any, incident: ScrapedIncident): Promise<boolean> {
  // Check by URL
  const { data: existingByUrl } = await supabaseClient
    .from('cases')
    .select('id')
    .eq('scraped_from_url', incident.article_url)
    .limit(1)

  if (existingByUrl && existingByUrl.length > 0) {
    return true
  }

  // Check by similar content
  if (incident.victim_name && incident.location && incident.incident_date) {
    const { data: existingSimilar } = await supabaseClient
      .from('cases')
      .select('id')
      .eq('victim_name', incident.victim_name)
      .eq('location', incident.location)
      .eq('incident_date', incident.incident_date)
      .limit(1)

    if (existingSimilar && existingSimilar.length > 0) {
      return true
    }
  }

  return false
}

async function storeIncidentForReview(supabaseClient: any, incident: ScrapedIncident, jobId: string): Promise<void> {
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
    status: incident.confidence_score >= 80 ? 'approved' : 'pending',
    scraped_from_url: incident.article_url,
    scraping_job_id: jobId,
    confidence_score: incident.confidence_score,
    auto_approved: incident.confidence_score >= 80
  }

  await supabaseClient
    .from('case_submissions')
    .insert(submissionData)

  // If high confidence, also add directly to cases
  if (incident.confidence_score >= 80) {
    await supabaseClient
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
      })
  }
}
