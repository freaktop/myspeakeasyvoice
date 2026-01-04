# 🔧 Fix Black Screen on Vercel Deployment

## 🎯 Quick Fix: Set Environment Variables

The black screen is caused by **missing environment variables**. Here's how to fix it:

---

## ✅ Step 1: Go to Vercel Dashboard

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click on your project (`myspeakeasyvoice`)

---

## ✅ Step 2: Add Environment Variables

1. Click **"Settings"** tab (top menu)
2. Click **"Environment Variables"** (left sidebar)
3. Add these **required** variables:

### Required Variables:

```
VITE_SUPABASE_URL
```
- **Value:** `https://zofxbilhjehbtlbtence.supabase.co` (or your Supabase URL)
- **Environment:** Select **Production**, **Preview**, and **Development**

```
VITE_SUPABASE_ANON_KEY
```
- **Value:** Your Supabase anon key (get from Supabase dashboard)
- **Environment:** Select **Production**, **Preview**, and **Development**

### Optional Variables (if you need them):

```
VITE_WEBSOCKET_URL
```
- **Value:** Your WebSocket URL (e.g., `wss://your-websocket-server.com`)
- **Environment:** Select **Production**, **Preview**, and **Development**

```
VITE_API_URL
```
- **Value:** Your backend API URL (if you have one)
- **Environment:** Select **Production**, **Preview**, and **Development**

---

## ✅ Step 3: Redeploy

**Important:** After adding environment variables, you MUST redeploy:

1. Go to **"Deployments"** tab
2. Click the **"..."** (three dots) on the latest deployment
3. Click **"Redeploy"**
4. Wait for deployment to complete (1-3 minutes)

---

## 🔍 How to Get Supabase Credentials

1. Go to [app.supabase.com](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → Use for `VITE_SUPABASE_URL`
   - **anon/public key** → Use for `VITE_SUPABASE_ANON_KEY`

---

## 🐛 Troubleshooting

### Still seeing black screen?

1. **Check browser console:**
   - Open DevTools (F12)
   - Go to Console tab
   - Look for error messages
   - Should see: "Missing required environment variable: VITE_SUPABASE_URL" or similar

2. **Verify variables are set:**
   - Go to Vercel → Settings → Environment Variables
   - Make sure variables are set for **Production** environment
   - Check spelling (case-sensitive!)

3. **Check deployment logs:**
   - Go to Vercel → Deployments
   - Click on latest deployment
   - Check "Build Logs" for errors

4. **Clear browser cache:**
   - Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
   - Or clear browser cache

---

## ✅ Verification Checklist

After setting environment variables and redeploying:

- [ ] Environment variables added in Vercel
- [ ] Variables set for **Production** environment
- [ ] Redeployed after adding variables
- [ ] Deployment succeeded (check build logs)
- [ ] Visit deployed URL
- [ ] Check browser console (F12) - no red errors
- [ ] App loads (not black screen)
- [ ] Can see sign up/sign in page

---

## 📝 Common Issues

### Issue: "Missing required environment variable"
**Fix:** Add the variable in Vercel Settings → Environment Variables

### Issue: Variables set but still not working
**Fix:** Must redeploy after adding variables

### Issue: Works locally but not on Vercel
**Fix:** Local `.env` file doesn't affect Vercel - must set in Vercel dashboard

### Issue: Build succeeds but app is black
**Fix:** Check browser console for JavaScript errors, verify environment variables

---

## 🎯 Quick Command Reference

If using Vercel CLI:

```bash
# Set environment variable
vercel env add VITE_SUPABASE_URL production

# List environment variables
vercel env ls

# Redeploy
vercel --prod
```

---

**Status:** After setting environment variables and redeploying, the black screen should be fixed! ✅

