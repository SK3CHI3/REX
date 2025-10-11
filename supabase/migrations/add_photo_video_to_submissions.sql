-- Migration: Add photo and video storage to case_submissions
-- Description: Adds columns to store photo URLs and video links in case submissions
-- Created: 2025-10-11

-- ============================================================================
-- 1. Add photo_urls and video_urls columns to case_submissions
-- ============================================================================

ALTER TABLE public.case_submissions 
ADD COLUMN IF NOT EXISTS photo_urls TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS video_urls TEXT[] DEFAULT '{}';

-- Add column comments
COMMENT ON COLUMN public.case_submissions.photo_urls IS 'Array of photo URLs uploaded with the case submission';
COMMENT ON COLUMN public.case_submissions.video_urls IS 'Array of video URLs (YouTube, Twitter, etc.) submitted with the case';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================


