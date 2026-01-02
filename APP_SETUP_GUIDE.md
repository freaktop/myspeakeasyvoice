# SpeakEasy App Setup Guide

## ✅ Current Status

### What's Working:
1. ✅ **Supabase Authentication** - Sign up and sign in screens are implemented
2. ✅ **Routing** - Fixed to use AppContent which handles auth properly
3. ✅ **Capacitor Configuration** - Ready for mobile app build
4. ✅ **Build System** - Fixed esbuild issues, builds successfully
5. ✅ **WebSocket** - Configured with VITE_WEBSOCKET_URL

### What Needs Testing:
1. ⚠️ **Supabase Connection** - Verify it's connecting properly
2. ⚠️ **Sign Up/Sign In** - Test the auth flow
3. ⚠️ **Capacitor Build** - Build for Android/iOS

## 🔧 Supabase Connection

### Current Configuration:
- **URL**: `https://zofxbilhjehbtlbtence.supabase.co`
- **Anon Key**: Set in code (fallback) and `.env` file
- **Auth**: Configured with session persistence

### To Verify Connection:
1. Open browser console
2. Look for Supabase connection logs
3. Try signing up with a test account
4. Check Supabase dashboard for new user

### Environment Variables:
```bash
VITE_SUPABASE_URL=https://zofxbilhjehbtlbtence.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_WEBSOCKET_URL=wss://zofxbilhjehbtlbtence.functions.supabase.co/functions/v1/realtime-chat
```

## 📱 Capacitor Mobile App Setup

### Current Capacitor Config:
- **App ID**: `com.lovable.routinevoicepilot`
- **App Name**: `SpeakEasy Voice Control`
- **Web Dir**: `dist`

### To Build for Android:

1. **Build the web app:**
   ```bash
   npm run build
   ```

2. **Sync with Capacitor:**
   ```bash
   npx cap sync
   ```

3. **Open in Android Studio:**
   ```bash
   npx cap open android
   ```

4. **Build APK in Android Studio:**
   - Build → Build Bundle(s) / APK(s) → Build APK(s)

### To Build for iOS:

1. **Build the web app:**
   ```bash
   npm run build
   ```

2. **Sync with Capacitor:**
   ```bash
   npx cap sync
   ```

3. **Open in Xcode:**
   ```bash
   npx cap open ios
   ```

4. **Build in Xcode:**
   - Product → Archive

## 🔐 Authentication Flow

### Sign Up Process:
1. User visits app → Redirected to `/auth` if not logged in
2. User fills sign up form (email, password, display name)
3. Account created in Supabase
4. User redirected to onboarding or home

### Sign In Process:
1. User visits app → Redirected to `/auth` if not logged in
2. User fills sign in form (email, password)
3. Session created in Supabase
4. User redirected to home

### Protected Routes:
- All routes except `/auth`, `/privacy`, `/terms` require authentication
- `ProtectedRoute` component handles redirects
- `AppContent` component manages auth state

## 🚀 Running the App

### Development:
```bash
npm run dev
```

### Production Build:
```bash
npm run build
```

### Preview Build:
```bash
npm run preview
```

## 🐛 Troubleshooting

### Supabase Not Connecting:
1. Check `.env` file has correct variables
2. Check browser console for errors
3. Verify Supabase project is active
4. Check network tab for failed requests

### Auth Not Working:
1. Check Supabase dashboard → Authentication → Settings
2. Verify email confirmation is disabled (or enabled as needed)
3. Check browser console for auth errors
4. Clear localStorage and try again

### Build Failing:
1. Delete `node_modules` and `package-lock.json`
2. Run `npm install`
3. Try `npm run build` again

### Capacitor Issues:
1. Make sure `npm run build` succeeds first
2. Run `npx cap sync` after every build
3. Check `capacitor.config.ts` is correct
4. Verify Android Studio / Xcode is properly set up

## 📝 Next Steps

1. **Test Supabase Connection:**
   - Open app in browser
   - Check console for connection logs
   - Try creating an account

2. **Test Authentication:**
   - Sign up with test email
   - Sign out
   - Sign in again

3. **Build Mobile App:**
   - Run `npm run build`
   - Sync with Capacitor
   - Open in Android Studio / Xcode
   - Build and test on device

4. **Deploy:**
   - Deploy web version to Vercel
   - Build APK/IPA for mobile stores
   - Submit to Google Play / App Store

## ✅ Checklist

- [x] Supabase client configured
- [x] Auth pages created (sign up/sign in)
- [x] Routing fixed to use AppContent
- [x] Protected routes working
- [x] Build system working
- [x] Capacitor configured
- [ ] Supabase connection verified
- [ ] Auth flow tested
- [ ] Mobile app built and tested

