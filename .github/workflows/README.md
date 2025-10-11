# GitHub Actions Workflows

## Daily Site Rebuild

**File:** `daily-rebuild.yml`

**Purpose:** Automatically rebuilds the site every day to keep static HTML updated with new cases, ensuring AI crawlers always see the latest content.

### How It Works

1. **Scheduled Run:** Triggers daily at midnight UTC (3am EAT)
2. **Manual Trigger:** Can also be triggered manually from GitHub Actions tab
3. **On Push:** Runs when code is pushed to main branch
4. **Builds Site:** Runs `npm run build` which includes react-snap
5. **Deploys:** Automatically deploys to Netlify

### Required GitHub Secrets

You need to add these secrets in GitHub repo settings → Secrets and variables → Actions:

#### 1. VITE_SUPABASE_URL
- **Description:** Your Supabase project URL
- **Example:** `https://xxxxxxxxxx.supabase.co`
- **Get from:** Supabase Dashboard → Project Settings → API

#### 2. VITE_SUPABASE_ANON_KEY
- **Description:** Your Supabase anonymous/public key
- **Example:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Get from:** Supabase Dashboard → Project Settings → API

#### 3. NETLIFY_AUTH_TOKEN
- **Description:** Your Netlify personal access token
- **Get from:** 
  1. Go to Netlify → User Settings → Applications
  2. Click "New access token"
  3. Give it a name (e.g., "GitHub Actions")
  4. Copy the token

#### 4. NETLIFY_SITE_ID
- **Description:** Your Netlify site ID
- **Get from:** Netlify → Your Site → Site Settings → General → Site details → Site ID
- **Example:** `12345678-abcd-1234-abcd-123456789abc`

### How to Add Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret with the exact name above
5. Save

### Testing the Workflow

Once secrets are set up:

1. Go to **Actions** tab in GitHub
2. Click **Daily Site Rebuild & Deploy**
3. Click **Run workflow**
4. Select `main` branch
5. Click **Run workflow**

This will test the deployment immediately without waiting for the daily schedule.

### Monitoring

- Check the **Actions** tab to see workflow runs
- Green checkmark = successful deployment
- Red X = failed (check logs for details)
- Each run takes ~3-5 minutes

### Benefits

✅ **Automated:** No manual rebuilds needed  
✅ **Fresh Content:** AI bots see new cases within 24 hours  
✅ **Free:** Uses GitHub Actions free tier (2000 mins/month)  
✅ **Reliable:** Runs even if you're away  

### Netlify Build Minutes

- Free tier: 300 build minutes/month
- Each build takes ~2-3 minutes
- Daily builds = ~90 minutes/month
- Well within free tier limits!

### Troubleshooting

**Build fails with "Missing secrets":**
- Double-check all 4 secrets are added with correct names
- Verify Supabase URL and key are correct

**Deploy fails with "Netlify error":**
- Verify NETLIFY_AUTH_TOKEN is valid
- Verify NETLIFY_SITE_ID matches your site

**react-snap fails:**
- Usually due to missing environment variables
- Check that Supabase credentials are correct

