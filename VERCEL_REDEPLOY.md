# 🚀 How to Redeploy to Vercel

Since your app is already deployed on Vercel, here are the ways to redeploy with your new changes:

---

## Option 1: Automatic Redeploy via Git (Recommended) ✅

If your Vercel project is connected to GitHub/GitLab/Bitbucket, **just push your changes**:

```bash
cd myspeakeasyvoice-temp

# Stage all changes
git add -A

# Commit the changes
git commit -m "Fix critical production issues: env validation, console logs, error handlers, security headers"

# Push to trigger automatic redeploy
git push origin main
```

**What happens:**
- Vercel automatically detects the push
- Builds the new version
- Deploys to production
- You'll get a notification when done

**Check deployment:**
- Go to [vercel.com/dashboard](https://vercel.com/dashboard)
- Click on your project
- See the new deployment in the "Deployments" tab

---

## Option 2: Manual Redeploy via Vercel Dashboard

1. **Go to Vercel Dashboard:**
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click on your project

2. **Redeploy:**
   - Go to the "Deployments" tab
   - Find the latest deployment
   - Click the "..." menu (three dots)
   - Select **"Redeploy"**
   - Confirm the redeploy

**Note:** This redeploys the same code. If you want new changes, use Option 1 or 3.

---

## Option 3: Redeploy via Vercel CLI

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Navigate to project
cd myspeakeasyvoice-temp

# Login (if not already logged in)
vercel login

# Deploy (will redeploy if project already exists)
vercel --prod

# Or just deploy to preview first
vercel
```

**What happens:**
- Vercel detects existing project
- Asks if you want to link to existing project (say "Yes")
- Builds and deploys new version
- Shows you the deployment URL

---

## ⚙️ Update Environment Variables (If Needed)

If you need to update environment variables:

### Via Vercel Dashboard:
1. Go to your project in [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **"Settings"** tab
3. Click **"Environment Variables"**
4. Add or edit variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_WEBSOCKET_URL` (optional)
   - `VITE_API_URL` (optional)
5. **Important:** After adding/editing, you need to **redeploy** for changes to take effect

### Via Vercel CLI:
```bash
# Set environment variable
vercel env add VITE_SUPABASE_URL production

# List environment variables
vercel env ls

# Remove environment variable
vercel env rm VITE_SUPABASE_URL production
```

---

## 🔍 Verify Deployment

After redeploying, check:

1. **Visit your deployed URL:**
   - Should load without errors
   - Check browser console (F12) for errors

2. **Test critical features:**
   - Sign up / Sign in works
   - Voice commands work
   - No console errors in production

3. **Check Vercel logs:**
   - Go to your project → "Deployments" tab
   - Click on the latest deployment
   - Click "View Function Logs" or "Build Logs"
   - Look for any errors

---

## 🐛 Troubleshooting

### Build Fails:
- Check build logs in Vercel dashboard
- Verify all environment variables are set
- Check `vercel.json` configuration
- Ensure `npm run build` works locally

### Environment Variables Not Working:
- Make sure variables are set for **Production** environment
- Redeploy after adding/editing variables
- Check variable names match exactly (case-sensitive)

### App Not Loading:
- Check browser console for errors
- Verify environment variables are set
- Check Vercel deployment logs
- Ensure `dist` folder is being generated correctly

---

## 📋 Quick Checklist

Before redeploying:
- [ ] All changes committed to Git
- [ ] `npm run build` succeeds locally
- [ ] Environment variables are set in Vercel
- [ ] `vercel.json` is correct

After redeploying:
- [ ] Deployment succeeded (check Vercel dashboard)
- [ ] App loads at deployed URL
- [ ] No console errors in production
- [ ] Authentication works
- [ ] Voice features work (if applicable)

---

## 🎯 Recommended Workflow

**For this deployment:**

1. **Commit your changes:**
   ```bash
   git add -A
   git commit -m "Production fixes: env validation, console logs, error handlers, security headers"
   git push origin main
   ```

2. **Wait for automatic deployment** (usually 1-3 minutes)

3. **Verify deployment:**
   - Check Vercel dashboard
   - Visit deployed URL
   - Run smoke tests from `SMOKE_TEST_CHECKLIST.md`

4. **Update environment variables if needed:**
   - Go to Vercel Settings → Environment Variables
   - Add any missing variables
   - Redeploy after adding variables

---

## 💡 Pro Tips

- **Preview Deployments:** Vercel creates preview deployments for every branch/PR
- **Rollback:** If something breaks, you can rollback to a previous deployment in the dashboard
- **Build Logs:** Always check build logs if deployment fails
- **Environment Variables:** Use different values for Preview vs Production if needed

---

**Status:** Ready to redeploy! 🚀

