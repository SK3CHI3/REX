# Photo Upload Fix Documentation

## Issue Identified
Photos submitted with cases were not appearing after approval because:
1. The `case_submissions` table had no columns to store photo URLs
2. Photos were never uploaded to Supabase Storage
3. The approval process had no logic to copy photos to the `case_photos` table

## Solution Implemented

### 1. Database Migration
**File:** `supabase/migrations/add_photo_video_to_submissions.sql`

Added two columns to `case_submissions` table:
- `photo_urls` (TEXT[]) - Array of uploaded photo URLs
- `video_urls` (TEXT[]) - Array of video link URLs

```sql
ALTER TABLE public.case_submissions 
ADD COLUMN IF NOT EXISTS photo_urls TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS video_urls TEXT[] DEFAULT '{}';
```

### 2. Photo Upload on Submission
**File:** `src/lib/api.ts` - `submitCase()` function

When a user submits a case:
1. Photos are uploaded to Supabase Storage bucket `case-photos`
2. Each photo gets a unique filename: `case-submissions/{timestamp}-{random}.{ext}`
3. Public URLs are generated and stored in the `photo_urls` array
4. Video links are stored in the `video_urls` array

### 3. Photo Copy on Approval
**File:** `src/lib/api.ts` - `approveSubmission()` function

When an admin approves a case:
1. Retrieves the submission with photo_urls and video_urls
2. Creates the case in the main `cases` table
3. Copies each photo URL to the `case_photos` table with `case_id` reference
4. Copies each video URL to the `case_videos` table with `case_id` reference

### 4. Admin Dashboard Display
**File:** `src/pages/AdminDashboard.tsx`

Updated to show:
- Submitted photos in a grid layout (clickable to open full size)
- Video links as clickable URLs
- Photo/video count badges

### 5. TypeScript Interfaces Updated
**File:** `src/lib/supabase.ts`

Added to `DatabaseCaseSubmission`:
```typescript
photo_urls?: string[]
video_urls?: string[]
latitude?: number
longitude?: number
is_anonymous?: boolean
wants_updates?: boolean
```

## Required Setup

### Supabase Storage Bucket
A storage bucket named `case-photos` must be created in Supabase with:

**Settings:**
- **Public bucket:** Yes (for public access to photos)
- **File size limit:** 5MB per file (recommended)
- **Allowed MIME types:** image/jpeg, image/jpg, image/png, image/webp, image/gif

**To create the bucket:**
1. Go to Supabase Dashboard → Storage
2. Click "New bucket"
3. Name: `case-photos`
4. Toggle "Public bucket" ON
5. Click "Create bucket"

**Storage Policies (RLS):**
```sql
-- Allow public read access
CREATE POLICY "Public can view case photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'case-photos');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload case photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'case-photos' AND auth.role() = 'authenticated');

-- Or allow anonymous uploads (less secure but needed for public submissions)
CREATE POLICY "Anyone can upload case photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'case-photos');
```

## Testing Checklist

- [ ] Submit a case with photos through the form
- [ ] Verify photos appear in admin dashboard pending submissions
- [ ] Approve the submission
- [ ] Verify case appears in main cases list
- [ ] Open the case details modal
- [ ] Verify photos are displayed in the case
- [ ] Click photos to ensure they open in full size

## Flow Diagram

```
User Submits Case
    ↓
Photos uploaded to Storage (case-photos bucket)
    ↓
Photo URLs saved in case_submissions.photo_urls[]
    ↓
Admin reviews submission (sees photos)
    ↓
Admin approves
    ↓
Case created in cases table
    ↓
Photos copied to case_photos table
    ↓
Published case shows photos to public
```

## Troubleshooting

### Photos not uploading
- Check Supabase Storage bucket exists: `case-photos`
- Verify bucket is public
- Check browser console for upload errors
- Ensure file sizes are under limit (5MB)

### Photos not appearing after approval
- Verify `case_photos` table has entries
- Check SQL query: `SELECT * FROM case_photos WHERE case_id = 'YOUR_CASE_ID';`
- Verify photo URLs are accessible (not 404)

### Storage permission errors
- Check RLS policies on storage.objects
- Ensure anonymous upload policy exists if not requiring auth
- Verify CORS settings allow your domain

## Additional Notes

- Photos are stored permanently in storage even after submission is approved
- Consider implementing cleanup job for rejected submissions
- Maximum recommended photo upload: 5 photos per case
- File size limit helps prevent abuse and storage costs

## Migration Status
✅ Database schema updated
✅ Photo upload implemented
✅ Approval process updated
✅ Admin UI updated
⚠️ Storage bucket must be created manually



