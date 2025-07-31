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
    time: dbCase.incident_time,
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
    justiceServed: dbCase.justice_served,
    officersInvolved: dbCase.officer_names?.map(name => ({ name })) || [],
    witnesses: dbCase.witnesses || []
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
        incident_time: caseData.time,
        location: caseData.location,
        county: caseData.county,
        latitude: caseData.latitude,
        longitude: caseData.longitude,
        case_type: caseData.type,
        description: caseData.description,
        justice_served: caseData.justiceServed,
        officer_names: caseData.officerNames || [],
        witnesses: caseData.witnesses || [],
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

// Fetch pending case submissions
export async function fetchPendingSubmissions(): Promise<DatabaseCaseSubmission[]> {
  try {
    const { data, error } = await supabase
      .from('case_submissions')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching pending submissions:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Error in fetchPendingSubmissions:', error)
    throw error
  }
}

// Approve a case submission
export async function approveSubmission(submissionId: string): Promise<void> {
  try {
    // First, get the submission data
    const { data: submission, error: fetchError } = await supabase
      .from('case_submissions')
      .select('*')
      .eq('id', submissionId)
      .single()

    if (fetchError) {
      console.error('Error fetching submission:', fetchError)
      throw fetchError
    }

    // Create a new case in the main cases table
    const { error: insertError } = await supabase
      .from('cases')
      .insert({
        victim_name: submission.victim_name,
        age: submission.age,
        incident_date: submission.incident_date,
        location: submission.location,
        county: submission.county,
        latitude: submission.latitude || 0,
        longitude: submission.longitude || 0,
        case_type: submission.case_type,
        description: submission.description,
        status: 'investigating',
        source: 'user_submission',
        reported_by: submission.reporter_name,
        justice_served: false
      })

    if (insertError) {
      console.error('Error creating approved case:', insertError)
      throw insertError
    }

    // Update submission status to approved
    const { error: updateError } = await supabase
      .from('case_submissions')
      .update({
        status: 'approved',
        reviewed_at: new Date().toISOString()
      })
      .eq('id', submissionId)

    if (updateError) {
      console.error('Error updating submission status:', updateError)
      throw updateError
    }
  } catch (error) {
    console.error('Error in approveSubmission:', error)
    throw error
  }
}

// Reject a case submission
export async function rejectSubmission(submissionId: string, reason?: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('case_submissions')
      .update({
        status: 'rejected',
        review_notes: reason,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', submissionId)

    if (error) {
      console.error('Error rejecting submission:', error)
      throw error
    }
  } catch (error) {
    console.error('Error in rejectSubmission:', error)
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

// User Analytics Functions
export interface UserAnalytics {
  totalVisitors: number;
  activeToday: number;
  averageSessionMinutes: number;
  totalPageViews: number;
}

export async function fetchUserAnalytics(): Promise<UserAnalytics> {
  try {
    // Get total unique visitors
    const { count: totalVisitors, error: totalError } = await supabase
      .from('site_users')
      .select('*', { count: 'exact', head: true });

    if (totalError) throw totalError;

    // Get active users today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { count: activeToday, error: activeError } = await supabase
      .from('site_users')
      .select('*', { count: 'exact', head: true })
      .gte('last_visit', today.toISOString());

    if (activeError) throw activeError;

    // Get average session time and total page views
    const { data: sessionData, error: sessionError } = await supabase
      .from('site_users')
      .select('time_spent_seconds, page_views');

    if (sessionError) throw sessionError;

    const totalPageViews = sessionData?.reduce((sum, user) => sum + (user.page_views || 0), 0) || 0;
    const averageSessionSeconds = sessionData?.length > 0
      ? sessionData.reduce((sum, user) => sum + (user.time_spent_seconds || 0), 0) / sessionData.length
      : 0;

    return {
      totalVisitors: totalVisitors || 0,
      activeToday: activeToday || 0,
      averageSessionMinutes: Math.round(averageSessionSeconds / 60),
      totalPageViews
    };
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    return {
      totalVisitors: 0,
      activeToday: 0,
      averageSessionMinutes: 0,
      totalPageViews: 0
    };
  }
}

export interface RecentActivity {
  id: string;
  type: 'visit' | 'submission' | 'interaction';
  description: string;
  location: string;
  timestamp: string;
}

export async function fetchRecentActivity(): Promise<RecentActivity[]> {
  try {
    const { data, error } = await supabase
      .from('site_users')
      .select('id, city, last_visit, page_views')
      .order('last_visit', { ascending: false })
      .limit(5);

    if (error) throw error;

    return data?.map(user => ({
      id: user.id,
      type: 'visit' as const,
      description: `New visitor from ${user.city || 'Unknown location'}`,
      location: user.city || 'Unknown',
      timestamp: user.last_visit
    })) || [];
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return [];
  }
}
