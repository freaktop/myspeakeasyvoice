# 🔧 Fix "Can't Fetch" Error on Sign In

## 🎯 The Problem

The "can't fetch" error usually means:
1. **Wrong Supabase URL** in environment variables
2. **CORS not configured** in Supabase
3. **Network connectivity issue**
4. **Supabase project paused/deleted**

---

## ✅ Step 1: Verify Environment Variables in Vercel

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click your project → **Settings** → **Environment Variables**
3. Check these variables are set correctly:

### `VITE_SUPABASE_URL`
- Should be: `https://zofxbilhjehbtlbtence.supabase.co`
- **NOT** `http://` (must be `https://`)
- **NOT** with trailing slash
- **NOT** `functions.supabase.co` (that's for Edge Functions)

### `VITE_SUPABASE_ANON_KEY`
- Should be your Supabase anon/public key
- Get from: [app.supabase.com](https://app.supabase.com) → Your Project → Settings → API
- Should start with `eyJ...` (JWT token)

---

## ✅ Step 2: Check Supabase Project Status

1. Go to [app.supabase.com](https://app.supabase.com)
2. Check if your project is:
   - ✅ **Active** (not paused)
   - ✅ **Accessible** (can see dashboard)
   - ✅ **Has API enabled**

If project is paused:
- Click "Restore" to reactivate
- Wait a few minutes for it to come back online

---

## ✅ Step 3: Configure CORS in Supabase

1. Go to Supabase Dashboard → **Settings** → **API**
2. Scroll to **"CORS"** section
3. Add your Vercel domain to allowed origins:
   - `https://your-app.vercel.app`
   - `https://*.vercel.app` (for preview deployments)
   - Or use `*` for development (not recommended for production)

**Alternative:** Supabase usually allows all origins by default, but check if CORS is restricted.

---

## ✅ Step 4: Test Supabase Connection

Open browser console (F12) on your deployed app and check:

1. **Network Tab:**
   - Try to sign in
   - Look for failed requests to `*.supabase.co`
   - Check the error message

2. **Console Tab:**
   - Look for CORS errors
   - Look for network errors
   - Check if Supabase client initialized

---

## 🐛 Common Issues & Fixes

### Issue: "Failed to fetch"
**Possible causes:**
- Wrong Supabase URL
- Supabase project paused
- Network connectivity issue
- CORS blocked

**Fix:**
1. Verify `VITE_SUPABASE_URL` is correct
2. Check Supabase project is active
3. Check browser console for CORS errors
4. Verify environment variables are set for **Production** environment

### Issue: "Invalid API key"
**Fix:**
- Check `VITE_SUPABASE_ANON_KEY` is correct
- Get fresh key from Supabase dashboard
- Make sure it's the **anon/public** key, not service_role key

### Issue: "Network error"
**Fix:**
- Check internet connection
- Check if Supabase is down: [status.supabase.com](https://status.supabase.com)
- Try accessing Supabase dashboard directly

---

## 🔍 Debug Steps

### 1. Check Environment Variables

In Vercel:
- Go to Settings → Environment Variables
- Verify both variables are set
- Make sure they're set for **Production** environment
- Check for typos (case-sensitive!)

### 2. Check Browser Console

1. Open deployed app
2. Press F12 → Console tab
3. Try to sign in
4. Look for errors:
   - `Failed to fetch`
   - `CORS error`
   - `Network error`
   - `Invalid API key`

### 3. Test Supabase URL Directly

Open in browser:
```
https://zofxbilhjehbtlbtence.supabase.co/rest/v1/
```

Should return JSON (even if it's an error, it means Supabase is reachable).

### 4. Check Supabase Dashboard

1. Go to [app.supabase.com](https://app.supabase.com)
2. Select your project
3. Check:
   - Project is **Active** (not paused)
   - **Settings** → **API** shows correct URL and keys
   - **Authentication** → **Settings** is configured

---

## ✅ Quick Fix Checklist

- [ ] Environment variables set in Vercel
- [ ] `VITE_SUPABASE_URL` is correct (https://, no trailing slash)
- [ ] `VITE_SUPABASE_ANON_KEY` is correct (anon key, not service_role)
- [ ] Variables set for **Production** environment
- [ ] Redeployed after setting variables
- [ ] Supabase project is active (not paused)
- [ ] Can access Supabase dashboard
- [ ] Checked browser console for specific error
- [ ] Tested Supabase URL directly in browser

---

## 🚀 After Fixing

1. **Redeploy** in Vercel (even if variables are set, redeploy to ensure they're loaded)
2. **Clear browser cache** (Ctrl+Shift+R)
3. **Test sign in** again
4. **Check browser console** for any remaining errors

---

## 📞 Still Not Working?

If still getting "can't fetch" after checking everything:

1. **Share the exact error message** from browser console
2. **Check Supabase status**: [status.supabase.com](https://status.supabase.com)
3. **Verify Supabase URL** by accessing it directly in browser
4. **Check Vercel deployment logs** for any build/runtime errors
5. **Try creating a new Supabase project** if current one is corrupted

---

**Most common fix:** Wrong `VITE_SUPABASE_URL` or Supabase project is paused! ✅

