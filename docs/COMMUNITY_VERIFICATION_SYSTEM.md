# Community Verification System Documentation

## 📋 Table of Contents
1. [Overview](#overview)
2. [How It Works](#how-it-works)
3. [Database Schema](#database-schema)
4. [API Reference](#api-reference)
5. [Frontend Implementation](#frontend-implementation)
6. [Security & Anti-Spam](#security--anti-spam)
7. [User Guide](#user-guide)
8. [Admin Guide](#admin-guide)
9. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

The **Community Verification System** allows users to verify the authenticity of police brutality cases through community confirmations. This adds an additional layer of trust and validation beyond admin approval.

### Key Features
- ✅ **Two-tier verification**: Admin approval + Community confirmation
- 🔒 **Duplicate prevention**: IP-based and browser fingerprinting
- 🛡️ **Rate limiting**: Maximum 10 confirmations per IP per 24 hours
- 📊 **Real-time updates**: Instant verification status changes
- 🎨 **Visual indicators**: Dimmed markers for unverified cases
- 📱 **Mobile-friendly**: Responsive confirmation UI

### Verification Flow
```
Case Submitted → Admin Approves (relevance check) → Published → Community Confirms (authenticity check) → Verified
```

---

## 🔄 How It Works

### 1. Admin Approval (First Tier)
- Admin reviews case submissions for **relevance** and **completeness**
- Approved cases are published but marked as `needs_verification = TRUE`
- Sets `admin_approved_at` timestamp

### 2. Community Confirmation (Second Tier)
- Published cases are shown to users
- Unverified cases appear **dimmed** on the map (60% opacity with pulse animation)
- Users can click "Confirm This Case" in the CaseModal
- Each case needs **2 confirmations** to be community-verified
- After 2+ confirmations:
  - `community_verified = TRUE`
  - `needs_verification = FALSE`
  - Case appears normal (100% opacity)

### 3. Verification States
| State | Confirmations | Visual | Description |
|-------|--------------|--------|-------------|
| **Unverified** | 0 | Red dimmed marker (60% opacity, pulsing) | Needs community verification |
| **Partially Verified** | 1 | Red dimmed marker (60% opacity, pulsing) | 1 more confirmation needed |
| **Community Verified** | 2+ | Red bright marker (100% opacity) | Fully verified by community |

---

## 🗄️ Database Schema

### New Table: `case_confirmations`

```sql
CREATE TABLE public.case_confirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  user_ip VARCHAR(45) NOT NULL,                    -- Hashed IP address
  user_fingerprint TEXT,                           -- Browser fingerprint
  user_agent TEXT,                                 -- Browser user agent
  confirmed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_case_ip UNIQUE(case_id, user_ip)
);
```

**Indexes:**
- `idx_case_confirmations_case_id` on `case_id`
- `idx_case_confirmations_confirmed_at` on `confirmed_at DESC`
- `idx_case_confirmations_user_ip` on `user_ip`

### Updated `cases` Table

**New Columns:**
```sql
ALTER TABLE public.cases 
ADD COLUMN confirmation_count INTEGER DEFAULT 0,
ADD COLUMN community_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN admin_approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN needs_verification BOOLEAN DEFAULT TRUE;
```

**Indexes:**
- `idx_cases_community_verified` on `community_verified`
- `idx_cases_confirmation_count` on `confirmation_count DESC`
- `idx_cases_needs_verification` on `needs_verification`

### Automatic Trigger

**Function:** `update_case_verification()`
```sql
CREATE OR REPLACE FUNCTION public.update_case_verification()
RETURNS TRIGGER AS $$
DECLARE
  v_confirmation_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_confirmation_count
  FROM public.case_confirmations 
  WHERE case_id = NEW.case_id;
  
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
```

**Trigger:**
```sql
CREATE TRIGGER trigger_case_confirmation
AFTER INSERT ON public.case_confirmations
FOR EACH ROW
EXECUTE FUNCTION public.update_case_verification();
```

### Row Level Security (RLS)

**Policies:**
1. **SELECT**: Anyone can view confirmations
   ```sql
   CREATE POLICY "Confirmations are viewable by everyone"
   ON public.case_confirmations FOR SELECT
   USING (true);
   ```

2. **INSERT**: Only via service role (Edge Function)
   ```sql
   CREATE POLICY "Confirmations via service role only"
   ON public.case_confirmations FOR INSERT
   WITH CHECK (auth.role() = 'service_role' OR auth.role() = 'authenticated');
   ```

3. **UPDATE/DELETE**: Immutable (no updates/deletes allowed)
   ```sql
   CREATE POLICY "Confirmations are immutable"
   ON public.case_confirmations FOR UPDATE
   USING (false);
   ```

---

## 🔌 API Reference

### Edge Function: `confirm-case`

**Endpoint:**
```
POST https://[PROJECT_ID].supabase.co/functions/v1/confirm-case
```

**Request:**
```typescript
{
  case_id: string;           // UUID of the case
  user_fingerprint?: string; // Optional browser fingerprint
}
```

**Response (Success):**
```typescript
{
  success: true,
  message: "Case confirmed successfully",
  confirmation: {
    id: string,
    confirmed_at: string
  },
  case: {
    id: string,
    confirmation_count: number,
    community_verified: boolean,
    needs_verification: boolean
  }
}
```

**Response (Error - Already Confirmed):**
```typescript
{
  error: "You have already confirmed this case",
  already_confirmed: true
}
```

**Response (Error - Rate Limited):**
```typescript
{
  error: "Rate limit exceeded. You can only confirm 10 cases per 24 hours.",
  rate_limited: true
}
```

**Response (Error - Case Not Found):**
```typescript
{
  error: "Case not found"
}
```

### Verification Statistics Function

**Function:** `get_case_confirmation_stats(case_id UUID)`

```sql
SELECT * FROM get_case_confirmation_stats('CASE_UUID');
```

**Returns:**
| Column | Type | Description |
|--------|------|-------------|
| `confirmation_count` | BIGINT | Total confirmations |
| `community_verified` | BOOLEAN | TRUE if ≥2 confirmations |
| `recent_confirmations` | BIGINT | Confirmations in last 7 days |
| `last_confirmed_at` | TIMESTAMP | Most recent confirmation |

---

## 💻 Frontend Implementation

### TypeScript Types

**Updated Case Interface:**
```typescript
export interface Case {
  // ... existing fields
  confirmation_count?: number;
  community_verified?: boolean;
  needs_verification?: boolean;
  admin_approved_at?: string;
}

export interface CaseConfirmation {
  id: string;
  case_id: string;
  user_ip: string;
  user_fingerprint?: string;
  user_agent?: string;
  confirmed_at: string;
  created_at: string;
}

export interface ConfirmCaseResponse {
  success: boolean;
  message: string;
  confirmation: {
    id: string;
    confirmed_at: string;
  };
  case: {
    id: string;
    confirmation_count: number;
    community_verified: boolean;
    needs_verification: boolean;
  };
}
```

### Custom Hook: `useConfirmCase`

**Usage:**
```typescript
import { useConfirmCase } from '@/hooks/useConfirmCase';

function MyComponent() {
  const { confirmCase, isConfirming, error, hasConfirmed } = useConfirmCase();
  
  const handleConfirm = async () => {
    const result = await confirmCase(caseId);
    if (result) {
      console.log('Confirmed!', result);
    }
  };
  
  const userConfirmed = hasConfirmed(caseId);
  
  return (
    <button onClick={handleConfirm} disabled={isConfirming || userConfirmed}>
      {userConfirmed ? 'Already Confirmed' : 'Confirm Case'}
    </button>
  );
}
```

**Methods:**
- `confirmCase(caseId: string)` - Confirm a case
- `hasConfirmed(caseId: string)` - Check if user already confirmed
- `isConfirming` - Loading state
- `error` - Error message

### CaseModal Component

The `CaseModal` includes a **Community Verification Section** with:

1. **Progress Bar**: Visual indicator of confirmation progress (X/2)
2. **Verification Badge**: Green "Verified" badge when ≥2 confirmations
3. **Info Message**: Explains verification status
4. **Confirm Button**: 
   - Shows "Confirm This Case" if not confirmed
   - Shows "You've confirmed this case" if already confirmed
   - Disabled with spinner when confirming

**UI States:**
- ✅ **Verified (2+)**: Green badge, "Community Verified" message
- ⏳ **Partial (1)**: Cyan progress bar, "Needs 1 more confirmation"
- ⚠️ **Unverified (0)**: Cyan progress bar, "Needs 2 more confirmations"

### Map Markers

**Dimmed Markers (Unverified):**
- 50% opacity
- 20% grayscale filter
- 3-second pulse animation
- Uses `personRedIconMobileDimmed` or `personRedIconDesktopDimmed`

**Normal Markers (Verified):**
- 100% opacity
- No filters
- Uses `personRedIconMobile` or `personRedIconDesktop`

**CSS:**
```css
.dimmed-marker {
  opacity: 0.6;
  filter: grayscale(20%);
  animation: dimmed-pulse 3s ease-in-out infinite;
}

@keyframes dimmed-pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 0.7; }
}
```

---

## 🔐 Security & Anti-Spam

### 1. Duplicate Prevention

**IP-Based:**
- Client IP is hashed using SHA-256
- Stored in `user_ip` column
- Unique constraint on `(case_id, user_ip)`

**Browser Fingerprinting:**
- Collects: User agent, language, timezone, screen resolution, color depth
- Base64 encoded and stored in `user_fingerprint`
- Additional layer beyond IP

**Code:**
```typescript
const getUserFingerprint = (): string => {
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    new Date().getTimezoneOffset().toString(),
    screen.colorDepth.toString(),
    screen.width.toString() + 'x' + screen.height.toString(),
  ].join('|');
  
  return btoa(fingerprint); // Base64 encode
};
```

### 2. Rate Limiting

**Limits:**
- **10 confirmations per IP per 24 hours**
- Checked before insertion
- Returns 429 error if exceeded

**Edge Function Logic:**
```typescript
const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

const { count: recentConfirmations } = await supabase
  .from('case_confirmations')
  .select('id', { count: 'exact', head: true })
  .eq('user_ip', hashedIP)
  .gte('confirmed_at', twentyFourHoursAgo);

if (recentConfirmations >= 10) {
  return error('Rate limit exceeded');
}
```

### 3. Local Storage Tracking

**Prevents multiple confirmations from same browser:**
```typescript
localStorage.setItem(`confirmed_case_${caseId}`, 'true');
localStorage.setItem(`confirmed_case_${caseId}_at`, new Date().toISOString());
```

**Check before API call:**
```typescript
const hasConfirmed = (caseId: string): boolean => {
  const confirmed = localStorage.getItem(`confirmed_case_${caseId}`);
  return confirmed === 'true';
};
```

### 4. Immutable Records

- Confirmations **cannot be updated or deleted**
- Enforced by RLS policies
- Maintains audit trail

---

## 👥 User Guide

### How to Confirm a Case

1. **View a Case**: Click on a map marker or case card
2. **Open Details**: Case modal opens automatically
3. **Scroll Down**: Find "Community Verification" section
4. **Read Info**: Understand what confirmation means
5. **Click Confirm**: Press "Confirm This Case" button
6. **Success**: See confirmation count update in real-time

### What Does Confirming Mean?

**You should confirm a case if:**
- ✅ You have personal knowledge of the incident
- ✅ You witnessed the event
- ✅ You know the victim or their family
- ✅ You have reliable secondhand information

**Do NOT confirm if:**
- ❌ You're just guessing
- ❌ You want to inflate numbers
- ❌ You have no knowledge of the incident

### Visual Indicators

| Marker Appearance | Meaning |
|------------------|---------|
| **Bright red, solid** | Community verified (≥2 confirmations) |
| **Dimmed red, pulsing** | Needs verification (< 2 confirmations) |

### Confirmation Limits

- **10 confirmations per day** per person
- Once confirmed, cannot un-confirm
- Confirmation is anonymous (no name shown)

---

## 👨‍💼 Admin Guide

### Admin Workflow

1. **Review Submission**: Check case details in admin dashboard
2. **Approve for Relevance**: Admin approves if case is relevant
   - Sets `admin_approved_at` timestamp
   - Case becomes visible to public
   - Marked as `needs_verification = TRUE`

3. **Community Verifies**: Users confirm the case
   - No admin action needed
   - Automatic updates via database trigger

4. **Monitor Status**: Track verification progress
   - View confirmation count
   - See community verification status

### Admin Dashboard Features

**View Confirmation Stats:**
```sql
SELECT 
  id,
  victim_name,
  confirmation_count,
  community_verified,
  needs_verification,
  admin_approved_at
FROM cases
ORDER BY confirmation_count DESC;
```

**Cases Needing Verification:**
```sql
SELECT * FROM cases
WHERE needs_verification = TRUE
ORDER BY incident_date DESC;
```

**Most Verified Cases:**
```sql
SELECT * FROM cases
WHERE community_verified = TRUE
ORDER BY confirmation_count DESC
LIMIT 10;
```

### Manual Verification Override

Admins can manually set verification status:
```sql
UPDATE cases
SET 
  community_verified = TRUE,
  needs_verification = FALSE,
  confirmation_count = 2
WHERE id = 'CASE_UUID';
```

### View Confirmation History

```sql
SELECT 
  cc.*,
  c.victim_name
FROM case_confirmations cc
JOIN cases c ON c.id = cc.case_id
WHERE cc.case_id = 'CASE_UUID'
ORDER BY cc.confirmed_at DESC;
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. "You have already confirmed this case"

**Cause:** User already confirmed this case (IP or localStorage)

**Solution:**
- This is working as intended
- Cannot confirm same case twice
- Clear browser data to test (not for production)

#### 2. "Rate limit exceeded"

**Cause:** User confirmed 10+ cases in 24 hours

**Solution:**
- Wait 24 hours from first confirmation
- This prevents spam/abuse

#### 3. Confirmations not updating

**Cause:** Database trigger not firing

**Check:**
```sql
-- Verify trigger exists
SELECT * FROM information_schema.triggers
WHERE trigger_name = 'trigger_case_confirmation';

-- Manually run trigger logic
SELECT update_case_verification();
```

**Fix:**
```sql
-- Recreate trigger
DROP TRIGGER IF EXISTS trigger_case_confirmation ON case_confirmations;
CREATE TRIGGER trigger_case_confirmation
AFTER INSERT ON case_confirmations
FOR EACH ROW
EXECUTE FUNCTION update_case_verification();
```

#### 4. Edge Function not working

**Check Deployment:**
```bash
npx supabase functions list --project-ref PROJECT_ID
```

**Check Logs:**
```bash
npx supabase functions logs confirm-case --project-ref PROJECT_ID
```

**Redeploy:**
```bash
npx supabase functions deploy confirm-case --project-ref PROJECT_ID
```

#### 5. Markers not dimmed

**Check CSS:**
- Verify `dimmed-marker` class is applied
- Check `src/index.css` for animation styles
- Inspect element in browser DevTools

**Force Rebuild:**
```bash
npm run build
```

### Debug Mode

**Enable Console Logging:**
```typescript
// In useConfirmCase.ts
console.log('Confirming case:', caseId);
console.log('User fingerprint:', getUserFingerprint());
console.log('Already confirmed:', hasConfirmed(caseId));
```

**Check Network Tab:**
- Open DevTools → Network
- Click "Confirm This Case"
- Look for POST request to `/functions/v1/confirm-case`
- Check response status and body

### Database Queries for Debugging

**Check confirmation count accuracy:**
```sql
SELECT 
  c.id,
  c.victim_name,
  c.confirmation_count,
  (SELECT COUNT(*) FROM case_confirmations WHERE case_id = c.id) as actual_count
FROM cases c
WHERE c.confirmation_count != (SELECT COUNT(*) FROM case_confirmations WHERE case_id = c.id);
```

**Reset confirmation for testing:**
```sql
-- Delete confirmations for a case
DELETE FROM case_confirmations WHERE case_id = 'CASE_UUID';

-- Reset case verification status
UPDATE cases
SET 
  confirmation_count = 0,
  community_verified = FALSE,
  needs_verification = TRUE
WHERE id = 'CASE_UUID';
```

---

## 📊 Analytics & Reporting

### Key Metrics

**Verification Rate:**
```sql
SELECT 
  COUNT(*) FILTER (WHERE community_verified = TRUE) * 100.0 / COUNT(*) as verification_rate
FROM cases
WHERE admin_approved_at IS NOT NULL;
```

**Average Confirmations:**
```sql
SELECT AVG(confirmation_count) as avg_confirmations
FROM cases
WHERE admin_approved_at IS NOT NULL;
```

**Daily Confirmation Trends:**
```sql
SELECT 
  DATE(confirmed_at) as date,
  COUNT(*) as confirmations
FROM case_confirmations
GROUP BY DATE(confirmed_at)
ORDER BY date DESC
LIMIT 30;
```

**Top Confirmed Cases:**
```sql
SELECT 
  victim_name,
  location,
  confirmation_count,
  community_verified
FROM cases
ORDER BY confirmation_count DESC
LIMIT 20;
```

---

## 🚀 Future Enhancements

### Potential Features

1. **Verification Levels**
   - Bronze (2 confirmations)
   - Silver (5 confirmations)
   - Gold (10+ confirmations)

2. **User Reputation System**
   - Track accuracy of confirmations
   - Reward reliable confirmers
   - Weight confirmations by reputation

3. **Email Notifications**
   - Notify case submitter when verified
   - Alert when confirmation needed
   - Weekly verification digest

4. **Geographic Verification**
   - Require confirmer to be in same county
   - Use GPS location (with permission)
   - Weight local confirmations higher

5. **Time-Based Verification**
   - Confirmations within 48 hours worth more
   - Decay confirmation weight over time
   - Urgent verification alerts

6. **Anonymous Reporting**
   - Allow anonymous confirmations
   - Reduce weight of anonymous vs. verified users
   - Balance privacy and trust

---

## 📚 Resources

### Related Documentation
- [Database Schema](./DATABASE_SCHEMA.md)
- [API Documentation](./API_DOCUMENTATION.md)
- [Admin Guide](./ADMIN_GUIDE.md)
- [User Guide](./USER_GUIDE.md)

### External Links
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Triggers](https://www.postgresql.org/docs/current/sql-createtrigger.html)

### Support
- GitHub Issues: [Report a bug](https://github.com/YOUR_REPO/issues)
- Email: support@rextracker.online
- Discord: [Join our community](https://discord.gg/YOUR_INVITE)

---

## ✅ Checklist for Deployment

- [ ] Database migration applied (`20250110_community_verification.sql`)
- [ ] Edge Function deployed (`confirm-case`)
- [ ] Frontend types updated (`src/types/index.ts`)
- [ ] Hooks implemented (`useConfirmCase.ts`)
- [ ] UI components updated (`CaseModal.tsx`, `MapView.tsx`)
- [ ] CSS animations added (`index.css`)
- [ ] Environment variables set (Supabase URL, Anon Key)
- [ ] RLS policies enabled and tested
- [ ] Rate limiting tested (10 confirmations/24hrs)
- [ ] Local storage tracking verified
- [ ] Mobile responsiveness checked
- [ ] Build successful (`npm run build`)
- [ ] Deployed to production
- [ ] User documentation published

---

*Last Updated: January 10, 2025*
*Version: 1.0.0*

