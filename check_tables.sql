-- Check if tables exist
SELECT 'case_confirmations' as table_name, EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' AND table_name = 'case_confirmations'
) as exists;

-- Check if columns were added to cases table
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'cases'
  AND column_name IN ('confirmation_count', 'community_verified', 'needs_verification', 'admin_approved_at')
ORDER BY column_name;

-- Check if we can actually query case_confirmations
SELECT COUNT(*) as count FROM public.case_confirmations;

