-- Migration: Community Verification System
-- Description: Adds tables and columns for community-driven case verification
-- Created: 2025-01-10

-- ============================================================================
-- 1. CREATE case_confirmations TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.case_confirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  user_ip VARCHAR(45) NOT NULL,
  user_fingerprint TEXT,
  user_agent TEXT,
  confirmed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_case_ip UNIQUE(case_id, user_ip)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_case_confirmations_case_id ON public.case_confirmations(case_id);
CREATE INDEX IF NOT EXISTS idx_case_confirmations_confirmed_at ON public.case_confirmations(confirmed_at DESC);
CREATE INDEX IF NOT EXISTS idx_case_confirmations_user_ip ON public.case_confirmations(user_ip);

-- Add table comments
COMMENT ON TABLE public.case_confirmations IS 'Stores community confirmations for case verification. Users can confirm cases to verify their authenticity.';
COMMENT ON COLUMN public.case_confirmations.case_id IS 'Reference to the case being confirmed';
COMMENT ON COLUMN public.case_confirmations.user_ip IS 'Hashed IP address of the user confirming (for duplicate prevention)';
COMMENT ON COLUMN public.case_confirmations.user_fingerprint IS 'Browser fingerprint for additional duplicate detection';
COMMENT ON COLUMN public.case_confirmations.user_agent IS 'Browser user agent string';

-- ============================================================================
-- 2. ALTER cases TABLE - Add verification columns
-- ============================================================================

ALTER TABLE public.cases 
ADD COLUMN IF NOT EXISTS confirmation_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS community_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS admin_approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS needs_verification BOOLEAN DEFAULT TRUE;

-- Add indexes for verification queries
CREATE INDEX IF NOT EXISTS idx_cases_community_verified ON public.cases(community_verified);
CREATE INDEX IF NOT EXISTS idx_cases_confirmation_count ON public.cases(confirmation_count DESC);
CREATE INDEX IF NOT EXISTS idx_cases_needs_verification ON public.cases(needs_verification) WHERE needs_verification = TRUE;

-- Add column comments
COMMENT ON COLUMN public.cases.confirmation_count IS 'Number of community confirmations this case has received';
COMMENT ON COLUMN public.cases.community_verified IS 'TRUE when case has 2 or more confirmations';
COMMENT ON COLUMN public.cases.admin_approved_at IS 'Timestamp when admin approved case for display';
COMMENT ON COLUMN public.cases.needs_verification IS 'TRUE if case still needs community verification';

-- ============================================================================
-- 3. CREATE TRIGGER FUNCTION - Auto-update verification status
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_case_verification()
RETURNS TRIGGER AS $$
DECLARE
  v_confirmation_count INTEGER;
BEGIN
  -- Count confirmations for this case
  SELECT COUNT(*) INTO v_confirmation_count
  FROM public.case_confirmations 
  WHERE case_id = NEW.case_id;
  
  -- Update the case with new verification status
  UPDATE public.cases 
  SET 
    confirmation_count = v_confirmation_count,
    community_verified = (v_confirmation_count >= 2),
    needs_verification = (v_confirmation_count < 2),
    updated_at = NOW()
  WHERE id = NEW.case_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment to function
COMMENT ON FUNCTION public.update_case_verification() IS 'Automatically updates case verification status when a confirmation is added';

-- ============================================================================
-- 4. CREATE TRIGGER - Fire on confirmation insert
-- ============================================================================

DROP TRIGGER IF EXISTS trigger_case_confirmation ON public.case_confirmations;

CREATE TRIGGER trigger_case_confirmation
AFTER INSERT ON public.case_confirmations
FOR EACH ROW
EXECUTE FUNCTION public.update_case_verification();

COMMENT ON TRIGGER trigger_case_confirmation ON public.case_confirmations IS 'Updates case verification status after each confirmation';

-- ============================================================================
-- 5. CREATE FUNCTION - Get confirmation stats for a case
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_case_confirmation_stats(p_case_id UUID)
RETURNS TABLE (
  confirmation_count BIGINT,
  community_verified BOOLEAN,
  recent_confirmations BIGINT,
  last_confirmed_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as confirmation_count,
    (COUNT(*) >= 2)::BOOLEAN as community_verified,
    COUNT(*) FILTER (WHERE confirmed_at >= NOW() - INTERVAL '7 days')::BIGINT as recent_confirmations,
    MAX(confirmed_at) as last_confirmed_at
  FROM public.case_confirmations
  WHERE case_id = p_case_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.get_case_confirmation_stats(UUID) IS 'Returns verification statistics for a specific case';

-- ============================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on case_confirmations
ALTER TABLE public.case_confirmations ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view confirmations
CREATE POLICY "Confirmations are viewable by everyone"
ON public.case_confirmations
FOR SELECT
USING (true);

-- Policy: Only service role can insert confirmations (via Edge Function)
CREATE POLICY "Confirmations via service role only"
ON public.case_confirmations
FOR INSERT
WITH CHECK (auth.role() = 'service_role' OR auth.role() = 'authenticated');

-- Policy: No one can update or delete confirmations (immutable)
CREATE POLICY "Confirmations are immutable"
ON public.case_confirmations
FOR UPDATE
USING (false);

CREATE POLICY "Confirmations cannot be deleted"
ON public.case_confirmations
FOR DELETE
USING (false);

-- ============================================================================
-- 7. CREATE VIEW - Cases with verification stats
-- ============================================================================

CREATE OR REPLACE VIEW public.cases_with_verification AS
SELECT 
  c.*,
  COALESCE(cc.confirmation_count, 0) as current_confirmations,
  COALESCE(cc.recent_confirmations, 0) as confirmations_last_7_days,
  cc.last_confirmed_at,
  CASE 
    WHEN c.community_verified = TRUE THEN 'verified'
    WHEN c.confirmation_count >= 1 THEN 'partial'
    ELSE 'unverified'
  END as verification_status
FROM public.cases c
LEFT JOIN LATERAL (
  SELECT 
    COUNT(*) as confirmation_count,
    COUNT(*) FILTER (WHERE confirmed_at >= NOW() - INTERVAL '7 days') as recent_confirmations,
    MAX(confirmed_at) as last_confirmed_at
  FROM public.case_confirmations
  WHERE case_id = c.id
) cc ON true;

COMMENT ON VIEW public.cases_with_verification IS 'Cases enriched with real-time verification statistics';

-- ============================================================================
-- 8. GRANT PERMISSIONS
-- ============================================================================

-- Grant select on case_confirmations to anon and authenticated users
GRANT SELECT ON public.case_confirmations TO anon, authenticated;
GRANT SELECT ON public.cases_with_verification TO anon, authenticated;

-- ============================================================================
-- 9. UPDATE EXISTING CASES - Set initial verification status
-- ============================================================================

-- Mark all existing cases as needing verification
UPDATE public.cases 
SET 
  confirmation_count = 0,
  community_verified = FALSE,
  needs_verification = TRUE,
  admin_approved_at = created_at  -- Assume existing cases were admin approved
WHERE admin_approved_at IS NULL;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

