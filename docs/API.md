# API Reference

Supabase integration and data access patterns for PoliceBrutalityTracker.

## Authentication

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)
```

## Cases API

### Get All Cases

```typescript
const { data: cases, error } = await supabase
  .from('cases')
  .select('*')
  .order('created_at', { ascending: false })
```

### Filter Cases by County

```typescript
const { data: cases, error } = await supabase
  .from('cases')
  .select('*')
  .eq('county', 'Nairobi')
```

### Search Cases

```typescript
const { data: cases, error } = await supabase
  .from('cases')
  .select('*')
  .textSearch('title', 'search_term')
```

## News API

### Get Published News

```typescript
const { data: news, error } = await supabase
  .from('news_articles')
  .select('*')
  .eq('published', true)
  .order('published_at', { ascending: false })
```

## Real-time Subscriptions

### Cases Updates

```typescript
const subscription = supabase
  .channel('cases_changes')
  .on('postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'cases' },
    (payload) => {
      console.log('New case added:', payload.new)
    }
  )
  .subscribe()
```

## RPC Functions

### approve_submission

Approve a pending case submission.

```typescript
const { data, error } = await supabase.rpc('approve_submission', {
  submission_id: 'uuid-here',
  user_id: 'user-uuid'
})
```

**Parameters:**
- `submission_id` (uuid) - ID of the pending submission
- `user_id` (uuid) - Admin user approving the submission

**Returns:**
- Success: `{ case_id: 'new-case-uuid' }`
- Error: `{ error: 'error message' }`

### reject_submission

Reject a pending case submission.

```typescript
const { data, error } = await supabase.rpc('reject_submission', {
  submission_id: 'uuid-here',
  reason: 'reason for rejection'
})
```

## Error Handling

```typescript
interface ApiError {
  message: string
  code: string
  details?: any
}

const handleApiError = (error: ApiError) => {
  console.error('API Error:', error.message)
  // Handle error appropriately
}
```

## Rate Limiting

Supabase enforces rate limits on API requests:
- **Cases API**: 100 requests/minute
- **News API**: 50 requests/minute
- **Search API**: 200 requests/minute

Headers returned with rate limit info:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Security

### Row Level Security (RLS)

All tables have RLS policies enabled. Anonymous users can:
- Read published cases
- Read published news
- Submit new cases (via case_submissions table)

Authenticated admins can:
- Approve/reject submissions (via RPC functions)
- Manage news articles
- Access admin dashboard data

### Input Validation

Use Zod schemas for all user input:
```typescript
import { z } from 'zod'

const caseSubmissionSchema = z.object({
  title: z.string().min(10),
  description: z.string().min(50),
  county: z.string(),
  date: z.string().date()
})
```
