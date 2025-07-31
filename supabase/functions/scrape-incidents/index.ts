import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 })
  }

  try {
    console.log('🔥 Starting Kenya Police Brutality Scraping Job')

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get enabled scraping sources
    const { data: sources, error: sourcesError } = await supabaseClient
      .from('scraping_sources')
      .select('*')
      .eq('enabled', true)

    if (sourcesError) {
      throw new Error(`Failed to fetch sources: ${sourcesError.message}`)
    }

    console.log(`📊 Found ${sources?.length || 0} enabled sources`)

    let totalJobs = 0
    const jobIds = []

    // Get Firecrawl API key
    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY')
    if (!firecrawlApiKey) {
      throw new Error('FIRECRAWL_API_KEY not configured')
    }

    // Process only first 3 sources to avoid timeout (production will handle all via cron)
    const sourcesToProcess = (sources || []).slice(0, 3)
    console.log(`📊 Processing ${sourcesToProcess.length} sources (limited for manual runs)`)

    // Process each source with real scraping
    for (const source of sourcesToProcess) {
      try {
        console.log(`🔍 Processing source: ${source.name}`)

        // Create scraping job record
        const { data: job, error: jobError } = await supabaseClient
          .from('scraping_jobs')
          .insert({
            source_id: source.id,
            status: 'running',
            started_at: new Date().toISOString()
          })
          .select()
          .single()

        if (jobError) {
          console.error(`Failed to create job for ${source.name}:`, jobError)
          continue
        }

        totalJobs++
        jobIds.push(job.id)

        // Real scraping logic
        const scrapingResult = await performRealScraping(source, firecrawlApiKey, supabaseClient, job.id)

        // Update job with results
        await supabaseClient
          .from('scraping_jobs')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            articles_found: scrapingResult.articlesFound,
            incidents_extracted: scrapingResult.incidentsExtracted,
            urls_scraped: scrapingResult.urlsProcessed
          })
          .eq('id', job.id)

        // Update source last_scraped
        await supabaseClient
          .from('scraping_sources')
          .update({ last_scraped: new Date().toISOString() })
          .eq('id', source.id)

        console.log(`✅ Completed ${source.name}: ${scrapingResult.articlesFound} articles, ${scrapingResult.incidentsExtracted} incidents`)

      } catch (error) {
        console.error(`Error processing source ${source.name}:`, error)

        // Mark job as failed
        if (jobIds.length > 0) {
          await supabaseClient
            .from('scraping_jobs')
            .update({
              status: 'failed',
              completed_at: new Date().toISOString(),
              error_message: error.message
            })
            .eq('id', jobIds[jobIds.length - 1])
        }
      }
    }

    const result = {
      success: true,
      message: `Scraping completed successfully`,
      stats: {
        sources_processed: sources?.length || 0,
        jobs_created: totalJobs,
        job_ids: jobIds,
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

/**
 * Perform real scraping for a source using Firecrawl
 */
async function performRealScraping(source: any, apiKey: string, supabaseClient: any, jobId: string) {
  console.log(`🔥 Starting real scraping for ${source.name}`)

  let articlesFound = 0
  let incidentsExtracted = 0
  const urlsProcessed: string[] = []

  // Kenya-specific police brutality search queries (limited for manual runs)
  const allQueries = [
    `site:${source.base_url.replace('https://', '').replace('http://', '')} police brutality Kenya`,
    `site:${source.base_url.replace('https://', '').replace('http://', '')} police violence Kenya victim`,
    `site:${source.base_url.replace('https://', '').replace('http://', '')} extrajudicial killing Kenya`,
    `site:${source.base_url.replace('https://', '').replace('http://', '')} police shooting Kenya`,
    `site:${source.base_url.replace('https://', '').replace('http://', '')} unlawful arrest Kenya`,
    `site:${source.base_url.replace('https://', '').replace('http://', '')} IPOA investigation`,
    `site:${source.base_url.replace('https://', '').replace('http://', '')} human rights violation police`
  ]

  // Use only first 3 queries for manual runs to avoid timeout
  const searchQueries = allQueries.slice(0, 3)

  for (const query of searchQueries) {
    try {
      console.log(`🔍 Searching: ${query}`)

      // Use Firecrawl search to find relevant articles
      const searchResponse = await fetch('https://api.firecrawl.dev/v0/search', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          limit: 3, // Reduced limit for faster processing
          country: 'KE'
        }),
        signal: AbortSignal.timeout(15000) // 15 second timeout
      })

      if (!searchResponse.ok) {
        console.error(`Search failed for query "${query}": ${searchResponse.status}`)
        continue
      }

      const searchData = await searchResponse.json()

      if (!searchData.success || !searchData.data) {
        console.log(`No results for query: ${query}`)
        continue
      }

      // Process each found URL
      for (const result of searchData.data) {
        if (!result.url || urlsProcessed.includes(result.url)) {
          continue // Skip duplicates
        }

        try {
          console.log(`📄 Processing article: ${result.url}`)

          // Check if we already have this article
          const { data: existingArticle } = await supabaseClient
            .from('scraped_articles')
            .select('id')
            .eq('url', result.url)
            .single()

          if (existingArticle) {
            console.log(`⏭️ Article already exists: ${result.url}`)
            continue
          }

          // Scrape and extract incident data
          const incident = await scrapeAndExtractIncident(result.url, apiKey)

          if (incident) {
            // Store the article
            const { data: article, error: articleError } = await supabaseClient
              .from('scraped_articles')
              .insert({
                job_id: jobId,
                source_id: source.id,
                url: result.url,
                title: incident.article_title,
                content: incident.description,
                published_date: incident.published_date,
                processed: true,
                extracted_data: incident,
                incidents_extracted: 1
              })
              .select()
              .single()

            if (!articleError) {
              articlesFound++
              urlsProcessed.push(result.url)

              // If this looks like a real incident with a victim, store it for review
              if (incident.victim_name && incident.case_type && incident.location) {
                await storeIncidentForReview(supabaseClient, incident, jobId)
                incidentsExtracted++
                console.log(`✅ Extracted incident: ${incident.victim_name} in ${incident.location}`)
              }
            }
          } else {
            // Store article even if no incident found
            await supabaseClient
              .from('scraped_articles')
              .insert({
                job_id: jobId,
                source_id: source.id,
                url: result.url,
                title: result.title || 'Unknown Title',
                processed: true,
                incidents_extracted: 0
              })

            articlesFound++
            urlsProcessed.push(result.url)
          }

        } catch (error) {
          console.error(`Error processing URL ${result.url}:`, error)
        }
      }

    } catch (error) {
      console.error(`Error with search query "${query}":`, error)
    }
  }

  console.log(`📊 Scraping completed for ${source.name}: ${articlesFound} articles, ${incidentsExtracted} incidents`)

  return {
    articlesFound,
    incidentsExtracted,
    urlsProcessed
  }
}

/**
 * Scrape an article and extract incident data using Firecrawl
 */
async function scrapeAndExtractIncident(url: string, apiKey: string) {
  try {
    console.log(`🔍 Extracting incident data from: ${url}`)

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
          extractionPrompt: `Extract SPECIFIC police brutality incident information from this Kenyan news article. Focus ONLY on ACTUAL incidents with named victims, not general news about police brutality. Return JSON with:

          - victim_name: string (FULL NAME of the specific victim - must be a real person's name)
          - age: number (exact age of victim if mentioned)
          - incident_date: string (YYYY-MM-DD format - when the incident occurred)
          - location: string (SPECIFIC location where incident happened - city, area, street)
          - county: string (Kenyan county where incident occurred)
          - case_type: "death" | "assault" | "harassment" | "unlawful_arrest" | "torture"
          - description: string (DETAILED description of what happened to the victim)
          - justice_served: boolean (has justice been served or case resolved)
          - police_station: string (which police station was involved)
          - officer_names: array of strings (names of officers involved if mentioned)
          - witnesses: array of strings (names of witnesses if mentioned)
          - case_number: string (official case/complaint number if mentioned)
          - family_contact: string (victim's family contact if mentioned)

          IMPORTANT: Only extract if this describes a SPECIFIC incident with a NAMED VICTIM.
          If the article is just general news about police brutality without specific victim details, return null.
          The victim_name must be a real person's name, not generic terms like "man", "woman", "youth".`,
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
                enum: ['death', 'assault', 'harassment', 'unlawful_arrest', 'torture']
              },
              description: { type: 'string' },
              justice_served: { type: 'boolean' },
              police_station: { type: 'string' },
              officer_names: { type: 'array', items: { type: 'string' } },
              witnesses: { type: 'array', items: { type: 'string' } },
              case_number: { type: 'string' },
              family_contact: { type: 'string' }
            },
            required: ['victim_name', 'case_type', 'description', 'location']
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
      console.log(`No incident data extracted from ${url}`)
      return null
    }

    const extracted = data.data.llm_extraction

    // Validate that we have a real incident with a named victim
    if (!extracted.victim_name || !extracted.case_type || !extracted.description || !extracted.location) {
      console.log(`Incomplete incident data from ${url}`)
      return null
    }

    // Check if victim_name looks like a real name (not generic terms)
    const genericTerms = ['man', 'woman', 'person', 'individual', 'victim', 'suspect', 'youth', 'boy', 'girl']
    if (genericTerms.some(term => extracted.victim_name.toLowerCase().includes(term))) {
      console.log(`Generic victim name detected, skipping: ${extracted.victim_name}`)
      return null
    }

    // Calculate confidence score
    const confidence = calculateConfidenceScore(extracted)

    // Only return incidents with reasonable confidence (at least 60%)
    if (confidence < 60) {
      console.log(`Low confidence incident (${confidence}%), skipping`)
      return null
    }

    console.log(`✅ Valid incident extracted: ${extracted.victim_name} (${confidence}% confidence)`)

    return {
      victim_name: extracted.victim_name,
      age: extracted.age,
      incident_date: extracted.incident_date,
      location: extracted.location,
      county: extracted.county,
      case_type: extracted.case_type,
      description: extracted.description,
      justice_served: extracted.justice_served,
      police_station: extracted.police_station,
      officer_names: extracted.officer_names || [],
      witnesses: extracted.witnesses || [],
      case_number: extracted.case_number,
      family_contact: extracted.family_contact,
      source: data.data.metadata?.title || 'Unknown Source',
      article_url: url,
      article_title: data.data.metadata?.title || 'Unknown Title',
      published_date: data.data.metadata?.publishedTime || new Date().toISOString(),
      confidence_score: confidence
    }

  } catch (error) {
    console.error(`Error extracting incident from ${url}:`, error)
    return null
  }
}

/**
 * Calculate confidence score for extracted incident data
 */
function calculateConfidenceScore(data: any): number {
  let score = 0
  const weights = {
    victim_name: 0.25,      // Higher weight for victim name
    age: 0.1,
    incident_date: 0.15,
    location: 0.15,
    county: 0.1,
    case_type: 0.1,
    description: 0.15,
    police_station: 0.05,
    officer_names: 0.05,
    witnesses: 0.05,
    case_number: 0.05
  }

  Object.entries(weights).forEach(([field, weight]) => {
    if (data[field]) {
      if (Array.isArray(data[field])) {
        if (data[field].length > 0 && data[field].some((item: any) => item && item.toString().trim().length > 0)) {
          score += weight
        }
      } else if (data[field].toString().trim().length > 0) {
        score += weight
      }
    }
  })

  // Bonus points for specific details
  if (data.victim_name && data.victim_name.length > 5) score += 0.05
  if (data.description && data.description.length > 100) score += 0.05
  if (data.officer_names && data.officer_names.length > 0) score += 0.05
  if (data.incident_date) score += 0.05

  return Math.round(score * 100)
}

/**
 * Store incident for review in case_submissions table
 */
async function storeIncidentForReview(supabaseClient: any, incident: any, jobId: string) {
  try {
    // Check for duplicates first
    const { data: existingCase } = await supabaseClient
      .from('case_submissions')
      .select('id')
      .eq('victim_name', incident.victim_name)
      .eq('location', incident.location)
      .single()

    if (existingCase) {
      console.log(`Duplicate incident found for ${incident.victim_name}, skipping`)
      return
    }

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

    const { error } = await supabaseClient
      .from('case_submissions')
      .insert(submissionData)

    if (error) {
      console.error('Error storing incident for review:', error)
    } else {
      console.log(`📝 Stored incident for review: ${incident.victim_name}`)

      // If high confidence, also add directly to cases table
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

        console.log(`✅ Auto-approved high confidence case: ${incident.victim_name}`)
      }
    }
  } catch (error) {
    console.error('Error in storeIncidentForReview:', error)
  }
}
