# Technical Architecture

PoliceBrutalityTracker is a React-based platform for tracking and visualizing police brutality cases across Kenya.

## Frontend Stack

- **React 18** - Modern React with concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI + Shadcn/ui** - Accessible component library

## Backend & Database

- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Primary database
- **Row Level Security (RLS)** - Data protection
- **Real-time subscriptions** - Live data updates

## Maps & Visualization

- **Leaflet** - Open-source mapping library
- **React Leaflet** - React integration
- **Custom markers** - Incident visualization
- **Clustering** - Performance optimization

## Project Structure

```
src/
├── components/        # Reusable UI components
│   ├── ui/            # Shadcn/ui primitives
│   ├── MapView.tsx    # Map component
│   ├── CaseModal.tsx  # Case details modal
│   └── SEOHead.tsx    # SEO meta tags
├── pages/             # Route components
├── hooks/             # Custom React hooks
├── lib/               # Utility functions
└── types/             # TypeScript definitions
```

## State Management

- **React Query** - Server state management
- **React Context** - Global state (auth, theme)
- **Local state** - Component-specific state
- **URL state** - Filter and search parameters

## Performance Optimizations

### Code Splitting

```typescript
const LazyMapView = lazy(() => import('./components/MapView'));
const LazyAdminDashboard = lazy(() => import('./pages/AdminDashboard'));
```

### Bundle Optimization

- Manual chunking - Separate vendor, UI, maps, and charts
- Tree shaking - Remove unused code
- Terser minification - Compress JavaScript
- Critical CSS - Inline above-the-fold styles

### Image Optimization

```typescript
<OptimizedImage
  src={imageUrl}
  alt="Description"
  loading="lazy"
  placeholder="blur"
/>
```

## Database Schema

### Core Tables

```sql
CREATE TABLE cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  victim_name TEXT NOT NULL,
  description TEXT,
  county TEXT NOT NULL,
  latitude DECIMAL,
  longitude DECIMAL,
  case_type TEXT NOT NULL,
  incident_date DATE NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE case_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  victim_name TEXT NOT NULL,
  description TEXT,
  county TEXT NOT NULL,
  case_type TEXT NOT NULL,
  incident_date DATE NOT NULL,
  status TEXT DEFAULT 'pending',
  submitted_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE news_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  author TEXT,
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMP,
  featured_image_url TEXT
);
```

### Security

- **RLS Policies** - User-based data access
- **API Keys** - Secure Supabase access
- **Input validation** - Zod schemas
- **CORS configuration** - Domain restrictions

## SEO Implementation

### Meta Tags

```html
<meta property="og:title" content="PoliceBrutalityTracker" />
<meta property="og:description" content="Tracking police brutality across Kenya" />
<meta property="og:image" content="https://policebrutalitytracker.co.ke/og-image.svg" />
```

### Structured Data

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "PoliceBrutalityTracker",
  "url": "https://policebrutalitytracker.co.ke"
}
```

## Deployment

### Netlify Configuration

```toml
[build]
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Security Features

- **Input sanitization** - Prevent XSS attacks
- **CSRF protection** - Secure form submissions
- **Rate limiting** - Prevent abuse
- **HTTPS only** - Encrypted connections
- **Anonymous reporting** - No personal data collection
- **Data minimization** - Only necessary data stored

## Development Tools

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Type checking
- **Husky** - Git hooks
- **Vite** - Fast builds
- **Bundle analyzer** - Size monitoring
- **Lighthouse** - Performance auditing
