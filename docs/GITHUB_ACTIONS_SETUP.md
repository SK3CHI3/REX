# GitHub Actions Auto-Deploy Setup Guide

## 🎯 What This Does

Automatically rebuilds and deploys your site **every day at midnight** so that:
- New cases are visible to AI crawlers (ChatGPT, Claude, Google AI)
- Static HTML is always up-to-date
- No manual work needed!

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Get Your Netlify Tokens

#### A. Get Netlify Auth Token
1. Go to [Netlify](https://app.netlify.com)
2. Click your profile picture → **User settings**
3. Scroll down to **Applications**
4. Under **Personal access tokens** → Click **New access token**
5. Name it: `GitHub Actions`
6. Click **Generate token**
7. **COPY THE TOKEN** (you won't see it again!)

#### B. Get Netlify Site ID
1. Go to your site on Netlify
2. Click **Site settings**
3. Under **General** → **Site details**
4. Find **Site ID** (looks like: `12345678-abcd-1234-abcd-123456789abc`)
5. **COPY THE SITE ID**

---

### Step 2: Get Your Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **Settings** (gear icon) → **API**
4. Copy these two values:
   - **Project URL** (starts with `https://`)
   - **anon public** key (long string starting with `eyJ...`)

---

### Step 3: Add Secrets to GitHub

1. Go to your GitHub repository: `https://github.com/SK3CHI3/REX`
2. Click **Settings** tab
3. In left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret** button

**Add these 4 secrets one by one:**

| Secret Name | Value | Where to Get It |
|------------|-------|-----------------|
| `NETLIFY_AUTH_TOKEN` | Token from Step 1A | Netlify → User settings → Applications |
| `NETLIFY_SITE_ID` | Site ID from Step 1B | Netlify → Site settings → Site ID |
| `VITE_SUPABASE_URL` | Your Supabase URL | Supabase → Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key | Supabase → Settings → API → anon public |

For each secret:
1. Click **New repository secret**
2. Enter the **Name** exactly as shown above
3. Paste the **Value**
4. Click **Add secret**

---

### Step 4: Test It!

1. Go to **Actions** tab in your GitHub repo
2. Click **Daily Site Rebuild & Deploy** workflow
3. Click **Run workflow** button (top right)
4. Select `main` branch
5. Click green **Run workflow** button

**Watch it run!**
- Should take 3-5 minutes
- Green checkmark = Success! 🎉
- Red X = Failed (check logs)

---

## 📅 When It Runs

### Automatic Runs:
- **Daily at midnight UTC** (3am Kenya time / 8pm EST)
- **Every push to main branch** (when you commit code)

### Manual Runs:
- Go to Actions tab → Daily Site Rebuild & Deploy → Run workflow

---

## 💡 What Happens Each Run

```
1. Checks out your code
2. Installs dependencies
3. Fetches latest cases from Supabase
4. Runs react-snap to generate static HTML
5. Deploys to Netlify
6. AI bots can now see new cases!
```

---

## 📊 Monitoring

### Check Workflow Status:
1. GitHub repo → **Actions** tab
2. See list of recent runs
3. Click any run to see detailed logs

### Check Netlify Deploys:
1. Netlify dashboard → Your site
2. Click **Deploys** tab
3. See deployment history

---

## 💰 Cost & Limits

### GitHub Actions (Free Tier):
- **2,000 minutes/month** free
- Each build: ~3 minutes
- Daily builds: ~90 minutes/month
- **YOU'RE GOOD! 🟢**

### Netlify (Free Tier):
- **300 build minutes/month** free
- Each build: ~2 minutes
- Daily builds: ~60 minutes/month
- **YOU'RE GOOD! 🟢**

---

## 🔧 Troubleshooting

### Build Fails with "Missing secrets"
**Fix:** Double-check all 4 secrets are added with correct names (case-sensitive!)

### Supabase Connection Error
**Fix:** 
- Verify `VITE_SUPABASE_URL` is correct (should start with `https://`)
- Verify `VITE_SUPABASE_ANON_KEY` is the **anon public** key, not service key

### Netlify Deploy Error
**Fix:**
- Verify `NETLIFY_AUTH_TOKEN` is valid (generate a new one if needed)
- Verify `NETLIFY_SITE_ID` matches your site ID

### react-snap Fails
**Fix:**
- This usually means environment variables are missing
- Re-check Supabase credentials

---

## 🎉 Success!

Once set up, your site will:
- ✅ Auto-rebuild every night
- ✅ Keep AI bots up-to-date
- ✅ Show new cases within 24 hours
- ✅ Require ZERO manual work!

---

## 📚 More Info

- See [.github/workflows/README.md](../.github/workflows/README.md) for technical details
- Check [Actions tab](https://github.com/SK3CHI3/REX/actions) for workflow runs
- Monitor [Netlify dashboard](https://app.netlify.com) for deployments

---

**Questions?** Check the Actions tab logs or Netlify deploy logs for details.

