# Deployment Guide

Deploying PoliceBrutalityTracker to Netlify.

## Prerequisites

- Netlify account
- GitHub repository connected
- Environment variables configured

## Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Add these in Netlify:
1. Site Settings > Environment variables
2. Add each variable with the correct value

## Build Settings

- **Build Command**: `npm run build`
- **Publish Directory**: `dist`
- **Node Version**: `18.x`

## Custom Domain

1. Go to Site Settings > Domain Management
2. Add custom domain: `policebrutalitytracker.co.ke`
3. Configure DNS records (A record pointing to Netlify load balancer)
4. Enable HTTPS (automatic with Netlify)

## Deployment Process

### Automatic Deployment

Every push to `main` triggers a new deployment:
1. GitHub webhook notifies Netlify
2. Netlify runs `npm install` and `npm run build`
3. Build output deployed to CDN
4. Previous deployment preserved for rollback

### Manual Deployment

```bash
# Build locally
npm run build

# Deploy using Netlify CLI
netlify deploy --prod --dir=dist
```

## Performance Optimization

### Before Deployment

```bash
# Run performance audit
npm run build
npm run preview

# Check bundle size
npm run analyze
```

### Post-Deployment Checklist

1. **Lighthouse Audit** - Run PageSpeed Insights
2. **Core Web Vitals** - Monitor performance
3. **SEO Check** - Verify meta tags and structured data
4. **Mobile Test** - Test on various devices

## Monitoring

### Analytics

- Google Analytics 4
- Core Web Vitals tracking
- Error monitoring
- User behavior analysis

### Alerts

- Performance degradation
- Error rate spikes
- Uptime monitoring
- Security incidents

## Rollback Strategy

### Quick Rollback

1. Go to Netlify Deploys
2. Select previous working version
3. Click "Publish deploy"
4. Verify functionality

### Emergency Procedures

1. Disable new features via feature flags
2. Revert to stable version
3. Monitor error logs
4. Notify users if needed

## Troubleshooting

### Build Fails

- Check build logs for errors
- Verify all environment variables are set
- Ensure dependencies are in package.json
- Test build locally first

### Deployment Not Updating

- Clear Netlify cache: Site Settings > Build & deploy > Clear cache
- Check if deploy is still processing
- Verify correct branch is deployed
- Hard refresh browser (Ctrl+Shift+R)

### Performance Issues

- Check bundle size with analyzer
- Review recent changes for performance impact
- Monitor Core Web Vitals dashboard
- Check server logs for slow queries

## Netlify Features

### Edge Functions

Custom serverless functions for dynamic content:
- API endpoints
- Form handlers
- Webhook receivers

### Forms

Netlify Forms for contact/submission:
- Automatic spam filtering
- Email notifications
- Integration with external services

### Split Testing

A/B testing with traffic splits:
- Deploy multiple versions
- Route traffic percentages
- Analyze conversion metrics
