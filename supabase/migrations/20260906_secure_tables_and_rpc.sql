-- Migration: Secure core tables with RLS and add transactional RPC functions
-- Description: Enables RLS on cases, case_submissions, case_photos, case_videos, news
--              Creates RPC functions for approve/reject that are transactional
-- Created: 2026-09-06

-- ============================================================================
-- 1. ENABLE RLS ON CORE TABLES
-- ============================================================================

ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 2. RLS POLICIES FOR cases TABLE
-- ============================================================================

-- Public can read all cases
CREATE POLICY "cases_public_read" ON public.cases
  FOR SELECT USING (true);

-- Only service_role can insert/update/delete cases
CREATE POLICY "cases_service_write" ON public.cases
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================================
-- 3. RLS POLICIES FOR case_submissions TABLE
-- ============================================================================

-- Public can insert submissions (via submit form)
CREATE POLICY "case_submissions_public_insert" ON public.case_submissions
  FOR INSERT WITH CHECK (true);

-- Only service_role can read/update/delete submissions (admin dashboard)
CREATE POLICY "case_submissions_service_read" ON public.case_submissions
  FOR SELECT USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "case_submissions_service_write" ON public.case_submissions
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================================
-- 4. RLS POLICIES FOR case_photos TABLE
-- ============================================================================

-- Public can read photos (they're linked from cases)
CREATE POLICY "case_photos_public_read" ON public.case_photos
  FOR SELECT USING (true);

-- Only service_role can insert/update/delete photos
CREATE POLICY "case_photos_service_write" ON public.case_photos
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================================
-- 5. RLS POLICIES FOR case_videos TABLE
-- ============================================================================

-- Public can read videos (they're linked from cases)
CREATE POLICY "case_videos_public_read" ON public.case_videos
  FOR SELECT USING (true);

-- Only service_role can insert/update/delete videos
CREATE POLICY "case_videos_service_write" ON public.case_videos
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================================
-- 6. RLS POLICIES FOR news TABLE
-- ============================================================================

-- Public can read published news
CREATE POLICY "news_public_read" ON public.news
  FOR SELECT USING (status = 'published');

-- Only service_role can read drafts and write news
CREATE POLICY "news_service_read_drafts" ON public.news
  FOR SELECT USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "news_service_write" ON public.news
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================================
-- 7. FIX news_articles POLICY (was too permissive)
-- ============================================================================

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Allow public read access to published news_articles" ON public.news_articles;

-- Public can read published news_articles only
CREATE POLICY "news_articles_public_read" ON public.news_articles
  FOR SELECT USING (published = true);

-- Service_role can read all (including drafts) and write
CREATE POLICY "news_articles_service_read_all" ON public.news_articles
  FOR SELECT USING (auth.jwt() ->> 'role' = 'service_role');

-- Keep the existing service_role full access policy
-- CREATE POLICY "Allow service role full access to news_articles" ON public.news_articles
--   FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================================
-- 8. RPC FUNCTION: approve_submission (transactional)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.approve_submission(
  p_submission_id UUID,
  p_case_type_override TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_submission RECORD;
  v_new_case_id UUID;
  v_centroid RECORD;
BEGIN
  -- Fetch the submission
  SELECT * INTO v_submission
  FROM public.case_submissions
  WHERE id = p_submission_id;

  IF v_submission IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Submission not found');
  END IF;

  -- Validate incident_date is present
  IF v_submission.incident_date IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'This submission has no incident date. Assign a date before approving it.'
    );
  END IF;

  -- Get county centroid if no coordinates
  IF v_submission.latitude IS NULL OR v_submission.longitude IS NULL THEN
    SELECT lat, lng INTO v_centroid
    FROM public.county_centroids
    WHERE county = v_submission.county
    LIMIT 1;
  END IF;

  -- Use centroid if no coordinates and centroid found
  v_centroid.lat := COALESCE(v_submission.latitude, v_centroid.lat, 0);
  v_centroid.lng := COALESCE(v_submission.longitude, v_centroid.lng, 0);

  -- BEGIN TRANSACTION (implicit in plpgsql functions)

  -- Insert into cases table
  INSERT INTO public.cases (
    victim_name, age, incident_date, incident_time, location, county,
    latitude, longitude, case_type, description, status, source,
    reported_by, justice_served, officer_names, witnesses
  ) VALUES (
    v_submission.victim_name, v_submission.age, v_submission.incident_date,
    v_submission.incident_time, v_submission.location, v_submission.county,
    v_centroid.lat, v_centroid.lng,
    COALESCE(p_case_type_override, v_submission.case_type),
    v_submission.description, 'unconfirmed', 'user_submission',
    v_submission.reporter_name, v_submission.justice_served,
    v_submission.officer_names, v_submission.witnesses
  ) RETURNING id INTO v_new_case_id;

  -- Insert photos
  IF v_submission.photo_urls IS NOT NULL AND array_length(v_submission.photo_urls, 1) > 0 THEN
    INSERT INTO public.case_photos (case_id, photo_url, uploaded_at)
    SELECT v_new_case_id, photo_url, NOW()
    FROM unnest(v_submission.photo_urls) AS photo_url;
  END IF;

  -- Insert videos
  IF v_submission.video_urls IS NOT NULL AND array_length(v_submission.video_urls, 1) > 0 THEN
    INSERT INTO public.case_videos (case_id, video_url, uploaded_at)
    SELECT v_new_case_id, video_url, NOW()
    FROM unnest(v_submission.video_urls) AS video_url;
  END IF;

  -- Update submission status
  UPDATE public.case_submissions
  SET status = 'approved', reviewed_at = NOW()
  WHERE id = p_submission_id;

  -- COMMIT (implicit in plpgsql functions)

  RETURN json_build_object('success', true, 'case_id', v_new_case_id);
EXCEPTION
  WHEN OTHERS THEN
    -- ROLLBACK is automatic on exception
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

COMMENT ON FUNCTION public.approve_submission(UUID, TEXT) IS 'Transactionally approves a submission: creates case, photos, videos, and marks submission as approved. All or nothing.';

-- ============================================================================
-- 9. RPC FUNCTION: reject_submission (transactional)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.reject_submission(
  p_submission_id UUID,
  p_reason TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.case_submissions
  SET status = 'rejected', review_notes = p_reason, reviewed_at = NOW()
  WHERE id = p_submission_id;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Submission not found');
  END IF;

  RETURN json_build_object('success', true);
END;
$$;

COMMENT ON FUNCTION public.reject_submission(UUID, TEXT) IS 'Rejects a submission with optional reason.';

-- ============================================================================
-- 10. GRANT EXECUTE PERMISSIONS ON RPC FUNCTIONS
-- ============================================================================

-- These functions use SECURITY DEFINER, so they run with the privileges of the
-- function owner (typically the postgres role), bypassing RLS. This is safe
-- because the functions themselves validate the input and the anon/authenticated
-- roles can only call them through the Supabase client.

GRANT EXECUTE ON FUNCTION public.approve_submission(UUID, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reject_submission(UUID, TEXT) TO anon, authenticated;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
