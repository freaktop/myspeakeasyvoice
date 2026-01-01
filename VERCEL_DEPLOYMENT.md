# Vercel Deployment Guide for SpeakEasy

This guide provides step-by-step instructions for deploying SpeakEasy to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://www.vercel.com)
2. **Git Repository**: Your code should be in a Git repository (GitHub, GitLab, or Bitbucket)
3. **Vercel CLI** (Optional): `npm i -g vercel`
4. **Environment Variables**: Prepare all required environment variables (see `.env.example`)

## Quick Deploy via Vercel Dashboard

### Step 1: Import Project

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your Git repository
4. Select your repository and click **"Import"**

### Step 2: Configure Project

**Framework Preset**: Other (or leave as default)

**Root Directory**: `routine-voice-pilot` (if your repo root is different)

**Build Command**: 
```bash
npm run build
```

**Output Directory**: 
```
dist/public
```

**Install Command**: 
```bash
npm install
```

### Step 3: Environment Variables

Click **"Environment Variables"** and add:

**Required Frontend Variables:**
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_WEBSOCKET_URL=wss://your-websocket-server.com
VITE_API_URL=https://your-backend.railway.app
```

**Note**: `VITE_API_URL` is required if deploying backend separately. If backend is on same domain, leave it unset.

**Required Backend Variables:**
```
DATABASE_URL=postgresql://user:password@host:port/database
OPENAI_API_KEY=your_openai_key_here
PORT=5000
```

**Optional:**
```
NODE_ENV=production
```

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for build to complete
3. Your app will be live at `https://your-project.vercel.app`

## Deploy via Vercel CLI

### Step 1: Install Vercel CLI

```bash
npm i -g vercel
```

### Step 2: Login

```bash
vercel login
```

### Step 3: Deploy

From your project root:

```bash
cd routine-voice-pilot
vercel
```

Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? (Select your account)
- Link to existing project? **No** (first time) or **Yes** (subsequent)
- Project name? (Enter or use default)
- Directory? `routine-voice-pilot` or `.`
- Override settings? **No**

### Step 4: Set Environment Variables

```bash
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_WEBSOCKET_URL
vercel env add DATABASE_URL
vercel env add OPENAI_API_KEY
```

### Step 5: Deploy to Production

```bash
vercel --prod
```

## Project Configuration

The `vercel.json` file is already configured with:

- **Builds**: Node.js server and static frontend
- **Routes**: API routes to server, static files to public
- **Rewrites**: SPA routing support

## Environment Variables Setup

### Production Environment

In Vercel Dashboard → Project Settings → Environment Variables:

1. Add each variable
2. Select **Production**, **Preview**, and **Development** as needed
3. Click **Save**

### Required Variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGc...` |
| `VITE_WEBSOCKET_URL` | WebSocket server URL | `wss://ws.example.com` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://...` |
| `OPENAI_API_KEY` | OpenAI API key | `sk-...` |
| `PORT` | Server port (optional) | `5000` |

## Deployment Options

### Option A: Frontend Only (Recommended)

Deploy frontend to Vercel, backend separately:

1. **Backend**: Deploy to Railway, Render, or Fly.io
2. **Frontend**: Deploy to Vercel (this guide)
3. Update API URLs in frontend environment variables

**Benefits:**
- Simpler deployment
- Better performance (CDN for frontend)
- Easier scaling
- Separate backend allows more flexibility

### Option B: Full Stack on Vercel

For full-stack deployment, you'll need to:
1. Convert Express routes to Vercel serverless functions
2. Update `vercel.json` with function configuration
3. Deploy everything together

**Note**: This requires more setup. Frontend-only is recommended for MVP.

## Custom Domain

1. Go to **Project Settings** → **Domains**
2. Add your custom domain
3. Configure DNS as instructed by Vercel
4. SSL certificate is automatic

## Continuous Deployment

Vercel automatically deploys:
- **Production**: Push to `main`/`master` branch
- **Preview**: Push to other branches or open PRs
- **Manual**: Deploy from dashboard or CLI

## Troubleshooting

### Build Fails

- Check build logs in Vercel Dashboard
- Verify Node version (should be 20+)
- Ensure all dependencies are in `package.json`
- Check for TypeScript errors: `npm run check`

### Environment Variables Not Working

- Variables must start with `VITE_` to be available in frontend
- Redeploy after adding new variables
- Check variable names match exactly (case-sensitive)
- Verify environment (Production/Preview/Development)

### API Routes Not Working

- Check `vercel.json` routes configuration
- Verify serverless function is deployed
- Check function logs in Vercel Dashboard
- Ensure backend environment variables are set

### WebSocket Connection Fails

- Verify `VITE_WEBSOCKET_URL` is set correctly
- Ensure WebSocket server supports wss:// (HTTPS)
- Check WebSocket server is accessible
- Verify auth token is being sent correctly

### CORS Errors

- Configure CORS on backend to allow Vercel domain
- Add `https://*.vercel.app` to allowed origins
- Check browser console for specific CORS errors

## Monitoring

- **Deployments**: View in Vercel Dashboard → Deployments
- **Logs**: View in Vercel Dashboard → Functions → Logs
- **Analytics**: Enable in Project Settings → Analytics
- **Speed Insights**: Enable in Project Settings → Speed Insights

## Next Steps

1. ✅ Set up production Supabase project
2. ✅ Configure production WebSocket server
3. ✅ Set up monitoring and error tracking (Sentry, etc.)
4. ✅ Configure custom domain
5. ✅ Enable analytics
6. ✅ Set up staging environment

## CLI Commands Reference

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View deployments
vercel ls

# View logs
vercel logs

# Remove deployment
vercel remove

# Link to existing project
vercel link
```

## Support

- Vercel Docs: https://vercel.com/docs
- Vercel Discord: https://vercel.com/discord
- Project Issues: Check GitHub issues

