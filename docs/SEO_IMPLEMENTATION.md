# SEO Implementation

Comprehensive SEO implementation for PoliceBrutalityTracker.

## Core SEO Elements

### Meta Tags & Open Graph

Every page includes:
- Title tag (unique per page)
- Meta description
- Open Graph tags (og:title, og:description, og:image)
- Twitter Card tags
- Canonical URL
- Geo-targeting (Kenya)
- Language targeting (en-KE)

### Structured Data (JSON-LD)

Implemented schemas:
- **Website** - Site-level schema
- **Organization** - PoliceBrutalityTracker as organization
- **Dataset** - Cases database as structured dataset
- **BreadcrumbList** - Navigation breadcrumbs
- **FAQPage** - Frequently asked questions
- **Article** - Individual case pages

### Technical SEO

- XML sitemap (`/sitemap.xml`)
- Robots.txt with proper directives
- Canonical URLs on all pages
- Mobile-first responsive design
- Core Web Vitals optimized
- Service worker for performance

## Implementation Details

### Dynamic Meta Tags

Using `SEOHead.tsx` component:

```typescript
<SEOHead
  title="Case: John Doe - Nairobi"
  description="Police brutality case in Nairobi..."
  image="https://policebrutalitytracker.co.ke/og-image.svg"
  url="https://policebrutalitytracker.co.ke/case/123"
/>
```

### Sitemap Generation

Auto-generated sitemap includes:
- Homepage (priority 1.0)
- All case pages (priority 0.8)
- News articles (priority 0.7)
- Static pages (priority 0.6)

### Robots.txt

```txt
User-agent: *
Allow: /
Disallow: /admin
Disallow: /sys-mgmt-portal

Sitemap: https://policebrutalitytracker.co.ke/sitemap.xml
```

## Performance Optimization

### Service Worker

- Cache-first for static assets
- Network-first for HTML pages
- Automatic cache invalidation
- Offline support

### Image Optimization

- Lazy loading with blur placeholders
- WebP format where supported
- Responsive images with srcset
- Proper alt text for accessibility

### Bundle Optimization

- Code splitting by route
- Tree shaking unused code
- Terser minification
- Critical CSS inlining

## Core Web Vitals

Target metrics:
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

Monitoring via:
- Lighthouse CI in build pipeline
- Real User Metrics (RUM) in production
- Google Search Console

## SEO Metrics

Tracked via Google Analytics 4:
- Organic search traffic
- Keyword rankings
- Click-through rates
- Page impressions
- Bounce rate
- Time on page

## Configuration Files

### Netlify

- `netlify.toml` - Build settings, redirects
- `_redirects` - SPA routing
- `_headers` - Security headers, caching

### SEO Files

- `sitemap.xml` - All pages and metadata
- `robots.txt` - Crawler directives
- `manifest.json` - PWA configuration

## Deployment Checklist

### Pre-deployment

- Update Google Analytics ID
- Verify all URLs in sitemap
- Test all redirects
- Check meta tags

### Post-deployment

- Submit sitemap to Google Search Console
- Verify robots.txt accessibility
- Test Core Web Vitals
- Check mobile usability
- Monitor crawl errors

## Monitoring

### Tools

- Google Search Console - Crawl errors, indexing status
- Google Analytics 4 - Traffic, user behavior
- PageSpeed Insights - Performance scores
- Screaming Frog - Technical SEO audit

### Key Metrics

- Organic search traffic
- Keyword rankings
- Click-through rates
- Core Web Vitals scores
- Indexing status

## Next Steps

1. **Content Strategy** - Regular blog posts, case studies
2. **Link Building** - Partnerships with human rights organizations
3. **Local SEO** - Google My Business, local directories
4. **Technical Improvements** - AMP pages, video optimization
