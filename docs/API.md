# 🔌 API Documentation

## Supabase Integration

### Authentication
```typescript
// Initialize Supabase client
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)
```

### Cases API

#### Get All Cases
```typescript
const { data: cases, error } = await supabase
  .from('cases')
  .select('*')
  .order('created_at', { ascending: false })
```

#### Filter Cases by County
```typescript
const { data: cases, error } = await supabase
  .from('cases')
  .select('*')
  .eq('county', 'Nairobi')
```

#### Search Cases
```typescript
const { data: cases, error } = await supabase
  .from('cases')
  .select('*')
  .textSearch('title', 'search_term')
```

### News API

#### Get Published News
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

## Error Handling

### API Error Response
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

### Request Limits
- **Cases API**: 100 requests/minute
- **News API**: 50 requests/minute
- **Search API**: 200 requests/minute

### Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```
