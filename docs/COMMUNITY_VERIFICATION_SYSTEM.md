# Community Verification System

Two-tier verification system: admin approval + community confirmation.

## How It Works

### 1. Admin Approval (First Tier)

- Admin reviews case submissions for relevance and completeness
- Approved cases are published but marked as `needs_verification = TRUE`
- Sets `admin_approved_at` timestamp

### 2. Community Confirmation (Second Tier)

- Published cases are shown to users
- Unverified cases appear dimmed on the map (60% opacity with pulse animation)
- Users can click "Confirm This Case" in the CaseModal
- Each case needs 2 confirmations to be community-verified
- After 2+ confirmations:
  - `community_verified = TRUE`
  - `needs_verification = FALSE`
  - Case appears normal (100% opacity)

### 3. Verification States

| State | Confirmations | Visual | Description |
|-------|--------------|--------|-------------|
| Unverified | 0 | Dimmed red marker (60% opacity, pulsing) | Needs community verification |
| Partial | 1 | Dimmed red marker (60% opacity, pulsing) | 1 more confirmation needed |
| Verified | 2+ | Bright red marker (100% opacity) | Fully verified by community |

## Database Schema

### case_confirmations Table

```sql
CREATE TABLE public.case_confirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  user_ip VARCHAR(45) NOT NULL,
  user_fingerprint TEXT,
  user_agent TEXT,
  confirmed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_case_ip UNIQUE(case_id, user_ip)
);
```

**Indexes:**
- `idx_case_confirmations_case_id` on `case_id`
- `idx_case_confirmations_confirmed_at` on `confirmed_at DESC`
- `idx_case_confirmations_user_ip` on `user_ip`

### Updated cases Table

```sql
ALTER TABLE public.cases
ADD COLUMN confirmation_count INTEGER DEFAULT 0,
ADD COLUMN community_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN admin_approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN needs_verification BOOLEAN DEFAULT TRUE;
```

### Automatic Trigger

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

CREATE TRIGGER trigger_case_confirmation
AFTER INSERT ON public.case_confirmations
FOR EACH ROW
EXECUTE FUNCTION public.update_case_verification();
```

### Row Level Security (RLS)

```sql
-- SELECT: Anyone can view confirmations
CREATE POLICY "Confirmations are viewable by everyone"
ON public.case_confirmations FOR SELECT
USING (true);

-- INSERT: Only via service role (Edge Function)
CREATE POLICY "Confirmations via service role only"
ON public.case_confirmations FOR INSERT
WITH CHECK (auth.role() = 'service_role' OR auth.role() = 'authenticated');

-- UPDATE/DELETE: Immutable (no updates/deletes allowed)
CREATE POLICY "Confirmations are immutable"
ON public.case_confirmations FOR UPDATE
USING (false);
```

## API Reference

### Edge Function: confirm-case

**Endpoint:**
```
POST https://[PROJECT_ID].supabase.co/functions/v1/confirm-case
```

**Request:**
```typescript
{
  case_id: string;
  user_fingerprint?: string;
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

### Verification Statistics Function

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

## Frontend Implementation

### TypeScript Types

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
```

### Custom Hook: useConfirmCase

```typescript
import { useConfirmCase } from '@/hooks/useConfirmCase';

function MyComponent() {
  const { confirmCase, isConfirming, error, hasConfirmed } = useConfirmCase();

  const handleConfirm = async () => {
    const result = await confirmCase(caseId);
  };

  const userConfirmed = hasConfirmed(caseId);

  return (
    <button onClick={handleConfirm} disabled={isConfirming || userConfirmed}>
      {userConfirmed ? 'Already Confirmed' : 'Confirm Case'}
    </button>
  );
}
```

### Map Markers

**Dimmed Markers (Unverified):**
- 50% opacity
- 20% grayscale filter
- 3-second pulse animation

**Normal Markers (Verified):**
- 100% opacity
- No filters

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

## Security & Anti-Spam

### 1. Duplicate Prevention

**IP-Based:**
- Client IP is hashed using SHA-256
- Stored in `user_ip` column
- Unique constraint on `(case_id, user_ip)`

**Browser Fingerprinting:**
```typescript
const getUserFingerprint = (): string => {
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    new Date().getTimezoneOffset().toString(),
    screen.colorDepth.toString(),
    screen.width.toString() + 'x' + screen.height.toString(),
  ].join('|');

  return btoa(fingerprint);
};
```

### 2. Rate Limiting

- 10 confirmations per IP per 24 hours
- Checked before insertion
- Returns 429 error if exceeded

### 3. Local Storage Tracking

```typescript
localStorage.setItem(`confirmed_case_${caseId}`, 'true');
localStorage.setItem(`confirmed_case_${caseId}_at`, new Date().toISOString());

const hasConfirmed = (caseId: string): boolean => {
  const confirmed = localStorage.getItem(`confirmed_case_${caseId}`);
  return confirmed === 'true';
};
```

### 4. Immutable Records

- Confirmations cannot be updated or deleted
- Enforced by RLS policies
- Maintains audit trail

## User Guide

### How to Confirm a Case

1. View a case (click on map marker or case card)
2. Open details (case modal opens automatically)
3. Scroll down to "Community Verification" section
4. Read information about what confirmation means
5. Click "Confirm This Case" button
6. See confirmation count update in real-time

### What Does Confirming Mean?

**Confirm if:**
- You have personal knowledge of the incident
- You witnessed the event
- You know the victim or their family
- You have reliable secondhand information

**Do NOT confirm if:**
- You're just guessing
- You want to inflate numbers
- You have no knowledge of the incident

### Confirmation Limits

- 10 confirmations per day per person
- Once confirmed, cannot un-confirm
- Confirmation is anonymous (no name shown)

## Admin Guide

### Admin Workflow

1. Review submission in admin dashboard
2. Approve for relevance (sets `admin_approved_at`, publishes case)
3. Community verifies (users confirm, no admin action needed)
4. Monitor status (view confirmation count and verification status)

### Admin Dashboard Queries

**Cases needing verification:**
```sql
SELECT * FROM cases
WHERE needs_verification = TRUE
ORDER BY incident_date DESC;
```

**Most verified cases:**
```sql
SELECT * FROM cases
WHERE community_verified = TRUE
ORDER BY confirmation_count DESC
LIMIT 10;
```

### Manual Verification Override

```sql
UPDATE cases
SET
  community_verified = TRUE,
  needs_verification = FALSE,
  confirmation_count = 2
WHERE id = 'CASE_UUID';
```

## Troubleshooting

### "You have already confirmed this case"

**Cause:** User already confirmed (IP or localStorage)

**Solution:** Working as intended. Cannot confirm same case twice.

### "Rate limit exceeded"

**Cause:** User confirmed 10+ cases in 24 hours

**Solution:** Wait 24 hours from first confirmation.

### Confirmations not updating

**Cause:** Database trigger not firing

**Check:**
```sql
SELECT * FROM information_schema.triggers
WHERE trigger_name = 'trigger_case_confirmation';
```

**Fix:**
```sql
DROP TRIGGER IF EXISTS trigger_case_confirmation ON case_confirmations;
CREATE TRIGGER trigger_case_confirmation
AFTER INSERT ON case_confirmations
FOR EACH ROW
EXECUTE FUNCTION public.update_case_verification();
```

### Edge Function not working

**Check deployment:**
```bash
npx supabase functions list --project-ref PROJECT_ID
```

**Check logs:**
```bash
npx supabase functions logs confirm-case --project-ref PROJECT_ID
```

**Redeploy:**
```bash
npx supabase functions deploy confirm-case --project-ref PROJECT_ID
```

## Analytics & Reporting

### Key Metrics

**Verification rate:**
```sql
SELECT
  COUNT(*) FILTER (WHERE community_verified = TRUE) * 100.0 / COUNT(*) as verification_rate
FROM cases
WHERE admin_approved_at IS NOT NULL;
```

**Average confirmations:**
```sql
SELECT AVG(confirmation_count) as avg_confirmations
FROM cases
WHERE admin_approved_at IS NOT NULL;
```

**Daily confirmation trends:**
```sql
SELECT
  DATE(confirmed_at) as date,
  COUNT(*) as confirmations
FROM case_confirmations
GROUP BY DATE(confirmed_at)
ORDER BY date DESC
LIMIT 30;
```

## Deployment Checklist

- Database migration applied
- Edge Function deployed
- Frontend types updated
- Hooks implemented
- UI components updated
- CSS animations added
- Environment variables set
- RLS policies enabled and tested
- Rate limiting tested
- Local storage tracking verified
- Mobile responsiveness checked
- Build successful
- Deployed to production
