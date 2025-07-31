import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types based on our schema
export interface DatabaseCase {
  id: string
  victim_name: string
  age?: number
  incident_date: string
  incident_time?: string
  location: string
  county: string
  latitude: number
  longitude: number
  case_type: 'death' | 'assault' | 'harassment' | 'unlawful_arrest' | 'other'
  description: string
  status: 'verified' | 'investigating' | 'dismissed'
  source?: string
  reported_by?: string
  justice_served: boolean
  officer_names?: string[]
  witnesses?: string[]
  created_at: string
  updated_at: string
}

export interface DatabaseCasePhoto {
  id: string
  case_id: string
  photo_url: string
  caption?: string
  uploaded_at: string
}

export interface DatabaseCaseVideo {
  id: string
  case_id: string
  video_url: string
  platform?: string
  title?: string
  uploaded_at: string
}

export interface DatabaseCaseSubmission {
  id: string
  victim_name: string
  age?: number
  incident_date: string
  incident_time?: string
  location: string
  county: string
  case_type: 'death' | 'assault' | 'harassment' | 'unlawful_arrest' | 'other'
  description: string
  justice_served?: boolean
  officer_names?: string[]
  witnesses?: string[]
  reporter_name: string
  reporter_contact: string
  status: 'pending' | 'approved' | 'rejected'
  reviewed_by?: string
  review_notes?: string
  created_at: string
  reviewed_at?: string
}
