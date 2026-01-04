# 🔧 Fix Supabase 400 Error on Sign In

## 🎯 The Problem

The **400 error** from Supabase means the authentication request is being **rejected** by Supabase. This is usually because:

1. **Wrong Supabase URL or API key**
2. **Supabase project configuration issue**
3. **Email confirmation required but not completed**
4. **Supabase Auth settings blocking the request**

---

## ✅ Step 1: Verify Environment Variables

**In Vercel Dashboard:**

1. Go to **Settings** → **Environment Variables**
2. Check these are set correctly:

### `VITE_SUPABASE_URL`
- Should be: `https://zofxbilhjehbtlbtence.supabase.co`
- **NOT** `http://`
- **NOT** with trailing slash
- **NOT** `functions.supabase.co`

### `VITE_SUPABASE_ANON_KEY`
- Get from: [app.supabase.com](https://app.supabase.com) → Your Project → **Settings** → **API**
- Should be the **anon/public** key (not service_role)
- Should start with `eyJ...`

---

## ✅ Step 2: Check Supabase Auth Settings

1. Go to [app.supabase.com](https://app.supabase.com)
2. Select your project
3. Go to **Authentication** → **Settings**
4. Check these settings:

### Email Confirmation
- If **"Enable email confirmations"** is ON:
  - Users must confirm email before signing in
  - Check email inbox for confirmation link
- If you want to disable (for testing):
  - Turn OFF "Enable email confirmations"
  - Save settings

### Site URL
- Should match your Vercel domain: `https://your-app.vercel.app`
- Or use: `https://*.vercel.app` for all preview deployments

### Redirect URLs
- Add your Vercel domain: `https://your-app.vercel.app/**`
- Add for auth callbacks

---

## ✅ Step 3: Test Supabase Connection

### Test 1: Check Supabase is reachable
Open in browser:
```
https://zofxbilhjehbtlbtence.supabase.co/rest/v1/
```

Should return JSON (even if error, means Supabase is reachable).

### Test 2: Check API key
Try this in browser console on your deployed app:
```javascript
// Check if env vars are loaded
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Has Anon Key:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
```

---

## 🐛 Common 400 Error Causes

### Cause 1: Email Confirmation Required
**Error:** "Email not confirmed" or similar

**Fix:**
- Check email inbox for confirmation link
- Or disable email confirmation in Supabase Auth settings

### Cause 2: Wrong Site URL
**Error:** "Invalid redirect URL"

**Fix:**
- Go to Supabase → Authentication → URL Configuration
- Add your Vercel domain to "Site URL" and "Redirect URLs"

### Cause 3: Invalid Credentials
**Error:** "Invalid login credentials"

**Fix:**
- Verify email/password are correct
- Check if account exists
- Try creating a new account first

### Cause 4: Supabase Project Paused
**Error:** 400 or connection errors

**Fix:**
- Check Supabase dashboard
- If paused, click "Restore"
- Wait a few minutes for project to come online

---

## ✅ Step 4: Disable Email Confirmation (For Testing)

If you want users to sign in immediately without email confirmation:

1. Go to Supabase Dashboard
2. **Authentication** → **Settings**
3. Scroll to **"Email Auth"**
4. Turn OFF **"Enable email confirmations"**
5. Click **"Save"**
6. Try signing in again

**Note:** For production, you should keep email confirmation ON for security.

---

## 🔍 Debug Steps

### 1. Check Browser Console
- Open DevTools (F12) → **Network** tab
- Try to sign in
- Look for the failed request to Supabase
- Click on it to see:
  - Request URL
  - Request payload
  - Response status (400)
  - Response body (error message)

### 2. Check Request Payload
The request should include:
- `email`: user's email
- `password`: user's password
- `grant_type`: "password"

If any of these are missing or wrong, that's the issue.

### 3. Check Response Error
The 400 response should include an error message. Common ones:
- `"Invalid login credentials"` - Wrong email/password
- `"Email not confirmed"` - Need to confirm email
- `"Invalid API key"` - Wrong anon key
- `"Invalid redirect URL"` - Site URL not configured

---

## ✅ Quick Fix Checklist

- [ ] Environment variables set correctly in Vercel
- [ ] `VITE_SUPABASE_URL` is correct (https://, no trailing slash)
- [ ] `VITE_SUPABASE_ANON_KEY` is correct (anon key, not service_role)
- [ ] Supabase project is active (not paused)
- [ ] Email confirmation disabled (if testing) or email confirmed
- [ ] Site URL configured in Supabase Auth settings
- [ ] Redirect URLs configured in Supabase
- [ ] Redeployed after setting environment variables
- [ ] Checked browser console for specific error message

---

## 🚀 After Fixing

1. **Redeploy** in Vercel
2. **Clear browser cache** (Ctrl+Shift+R)
3. **Try signing in** again
4. **Check browser console** for any remaining errors

---

## 📞 Still Getting 400 Error?

1. **Check the exact error message** in browser console → Network tab
2. **Share the error message** - it will tell us exactly what's wrong
3. **Verify Supabase project** is active and accessible
4. **Try creating a new account** to see if sign up works
5. **Check Supabase logs**: Dashboard → Logs → Auth logs

---

**Most common fix:** Disable email confirmation or configure Site URL in Supabase Auth settings! ✅

