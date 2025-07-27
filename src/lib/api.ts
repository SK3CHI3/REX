import { supabase, DatabaseCase, DatabaseCasePhoto, DatabaseCaseVideo, DatabaseCaseSubmission } from './supabase'
import { Case, SubmitCaseData } from '@/types'

// Transform database case to frontend case format
export function transformDatabaseCase(
  dbCase: DatabaseCase,
  photos: DatabaseCasePhoto[] = [],
  videos: DatabaseCaseVideo[] = []
): Case {
  return {
    id: dbCase.id,
    victimName: dbCase.victim_name,
    age: dbCase.age,
    date: dbCase.incident_date,
    location: dbCase.location,
    county: dbCase.county,
    coordinates: [dbCase.latitude, dbCase.longitude],
    type: dbCase.case_type,
    description: dbCase.description,
    status: dbCase.status,
    photos: photos.map(p => p.photo_url),
    videoLinks: videos.map(v => v.video_url),
    source: dbCase.source,
    reportedBy: dbCase.reported_by,
    justiceServed: dbCase.justice_served
  }
}

// Fetch all cases with their photos and videos
export async function fetchCases(): Promise<Case[]> {
  try {
    // Fetch cases
    const { data: cases, error: casesError } = await supabase
      .from('cases')
      .select('*')
      .order('incident_date', { ascending: false })

    if (casesError) {
      console.error('Error fetching cases:', casesError)
      throw casesError
    }

    if (!cases || cases.length === 0) {
      return []
    }

    // Fetch photos for all cases
    const { data: photos, error: photosError } = await supabase
      .from('case_photos')
      .select('*')

    if (photosError) {
      console.error('Error fetching photos:', photosError)
    }

    // Fetch videos for all cases
    const { data: videos, error: videosError } = await supabase
      .from('case_videos')
      .select('*')

    if (videosError) {
      console.error('Error fetching videos:', videosError)
    }

    // Transform and combine data
    return cases.map(dbCase => {
      const casePhotos = photos?.filter(p => p.case_id === dbCase.id) || []
      const caseVideos = videos?.filter(v => v.case_id === dbCase.id) || []
      return transformDatabaseCase(dbCase, casePhotos, caseVideos)
    })

  } catch (error) {
    console.error('Error in fetchCases:', error)
    throw error
  }
}

// Fetch a single case by ID
export async function fetchCaseById(id: string): Promise<Case | null> {
  try {
    const { data: dbCase, error: caseError } = await supabase
      .from('cases')
      .select('*')
      .eq('id', id)
      .single()

    if (caseError) {
      console.error('Error fetching case:', caseError)
      throw caseError
    }

    if (!dbCase) {
      return null
    }

    // Fetch photos
    const { data: photos, error: photosError } = await supabase
      .from('case_photos')
      .select('*')
      .eq('case_id', id)

    if (photosError) {
      console.error('Error fetching photos:', photosError)
    }

    // Fetch videos
    const { data: videos, error: videosError } = await supabase
      .from('case_videos')
      .select('*')
      .eq('case_id', id)

    if (videosError) {
      console.error('Error fetching videos:', videosError)
    }

    return transformDatabaseCase(dbCase, photos || [], videos || [])

  } catch (error) {
    console.error('Error in fetchCaseById:', error)
    throw error
  }
}

// Submit a new case
export async function submitCase(caseData: SubmitCaseData): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('case_submissions')
      .insert({
        victim_name: caseData.victimName,
        age: caseData.age,
        incident_date: caseData.date,
        location: caseData.location,
        county: caseData.county,
        case_type: caseData.type,
        description: caseData.description,
        reporter_name: caseData.reporterName,
        reporter_contact: caseData.reporterContact
      })
      .select('id')
      .single()

    if (error) {
      console.error('Error submitting case:', error)
      throw error
    }

    return data.id
  } catch (error) {
    console.error('Error in submitCase:', error)
    throw error
  }
}

// Fetch counties
export async function fetchCounties(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('counties')
      .select('name')
      .order('name')

    if (error) {
      console.error('Error fetching counties:', error)
      throw error
    }

    return data?.map(county => county.name) || []
  } catch (error) {
    console.error('Error in fetchCounties:', error)
    throw error
  }
}
