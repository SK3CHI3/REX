// Edge Function: confirm-case
// Description: Allows users to confirm a case for community verification
// Handles duplicate prevention, rate limiting, and updates case verification status

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ConfirmCaseRequest {
  case_id: string
  user_fingerprint?: string
}

interface RateLimitCheck {
  count: number
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Create Supabase client with service role (bypasses RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Parse request body
    const { case_id, user_fingerprint }: ConfirmCaseRequest = await req.json()

    if (!case_id) {
      return new Response(
        JSON.stringify({ error: 'case_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get client IP address (for duplicate prevention)
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
                     req.headers.get('x-real-ip') || 
                     'unknown'

    // Get user agent
    const userAgent = req.headers.get('user-agent') || 'unknown'

    // Hash the IP for privacy (simple hash for now)
    const hashedIP = await hashString(clientIP)

    console.log(`Confirmation request for case ${case_id} from IP: ${hashedIP.substring(0, 10)}...`)

    // ========================================
    // 1. Check if case exists
    // ========================================
    const { data: caseData, error: caseError } = await supabase
      .from('cases')
      .select('id, victim_name, confirmation_count')
      .eq('id', case_id)
      .single()

    if (caseError || !caseData) {
      console.error('Case not found:', caseError)
      return new Response(
        JSON.stringify({ error: 'Case not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ========================================
    // 2. Check if user already confirmed this case
    // ========================================
    const { data: existingConfirmation } = await supabase
      .from('case_confirmations')
      .select('id')
      .eq('case_id', case_id)
      .eq('user_ip', hashedIP)
      .single()

    if (existingConfirmation) {
      console.log('User already confirmed this case')
      return new Response(
        JSON.stringify({ 
          error: 'You have already confirmed this case',
          already_confirmed: true
        }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ========================================
    // 3. Rate limiting - Check confirmations from this IP in last 24 hours
    // ========================================
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    
    const { count: recentConfirmations } = await supabase
      .from('case_confirmations')
      .select('id', { count: 'exact', head: true })
      .eq('user_ip', hashedIP)
      .gte('confirmed_at', twentyFourHoursAgo)

    const RATE_LIMIT = 10 // Max 10 confirmations per 24 hours

    if (recentConfirmations && recentConfirmations >= RATE_LIMIT) {
      console.log(`Rate limit exceeded for IP: ${hashedIP.substring(0, 10)}...`)
      return new Response(
        JSON.stringify({ 
          error: `Rate limit exceeded. You can only confirm ${RATE_LIMIT} cases per 24 hours.`,
          rate_limited: true
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ========================================
    // 4. Insert confirmation
    // ========================================
    const { data: newConfirmation, error: insertError } = await supabase
      .from('case_confirmations')
      .insert({
        case_id,
        user_ip: hashedIP,
        user_fingerprint: user_fingerprint || null,
        user_agent: userAgent
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting confirmation:', insertError)
      
      // Check if it's a duplicate error (shouldn't happen due to earlier check, but just in case)
      if (insertError.code === '23505') {
        return new Response(
          JSON.stringify({ 
            error: 'You have already confirmed this case',
            already_confirmed: true
          }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ error: 'Failed to confirm case', details: insertError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ========================================
    // 5. Get updated case status (trigger will have updated it)
    // ========================================
    const { data: updatedCase } = await supabase
      .from('cases')
      .select('confirmation_count, community_verified, needs_verification')
      .eq('id', case_id)
      .single()

    console.log(`✅ Case ${case_id} confirmed. New count: ${updatedCase?.confirmation_count}`)

    // ========================================
    // 6. Return success response
    // ========================================
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Case confirmed successfully',
        confirmation: {
          id: newConfirmation.id,
          confirmed_at: newConfirmation.confirmed_at
        },
        case: {
          id: case_id,
          confirmation_count: updatedCase?.confirmation_count || 0,
          community_verified: updatedCase?.community_verified || false,
          needs_verification: updatedCase?.needs_verification ?? true
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// ========================================
// Helper function to hash strings (IP addresses)
// ========================================
async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(str)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}

/* To invoke this function locally for testing:
  
  curl -i --location --request POST 'http://localhost:54321/functions/v1/confirm-case' \
    --header 'Authorization: Bearer YOUR_ANON_KEY' \
    --header 'Content-Type: application/json' \
    --data '{"case_id":"YOUR_CASE_UUID"}'

*/

