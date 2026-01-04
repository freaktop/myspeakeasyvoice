# 🧪 Production Smoke Test Checklist

**Date:** $(Get-Date -Format "yyyy-MM-dd")  
**Environment:** Production  
**URL:** [Your deployed URL]

---

## ✅ Pre-Deployment Checks

- [ ] `npm run build` succeeds without errors
- [ ] No TypeScript compilation errors
- [ ] All environment variables set in deployment platform
- [ ] `.env.example` file is up to date
- [ ] `vercel.json` configuration is correct

---

## 🌐 App Load & Initialization

### 1. Page Loads
- [ ] Navigate to deployed URL
- [ ] Page loads without white screen
- [ ] No console errors in browser DevTools (F12)
- [ ] Splash screen appears briefly
- [ ] App transitions to main content

### 2. Environment Validation
- [ ] Check browser console for "✅ Environment variables validated" (dev mode only)
- [ ] No "Missing required environment variable" errors
- [ ] Supabase client initializes successfully

---

## 🔐 Authentication Flow

### 3. Sign Up
- [ ] Click "Sign Up" button/tab
- [ ] Enter test email and password
- [ ] Click "Create Account"
- [ ] Success message appears
- [ ] User is redirected to home page
- [ ] User session persists on page refresh

### 4. Sign In
- [ ] Sign out (if logged in)
- [ ] Click "Sign In" button/tab
- [ ] Enter credentials
- [ ] Click "Sign In"
- [ ] Success message appears
- [ ] User is redirected to home page
- [ ] User session persists on page refresh

### 5. Sign Out
- [ ] Click "Sign Out" button
- [ ] User is logged out
- [ ] Redirected to auth page
- [ ] Cannot access protected routes

---

## 🎤 Voice Features

### 6. Voice Recognition
- [ ] Click microphone button
- [ ] Browser requests microphone permission
- [ ] Click "Allow" for microphone access
- [ ] Microphone icon shows listening state
- [ ] Speak a command: "Hello SpeakEasy"
- [ ] Command appears in command history
- [ ] No console errors related to voice recognition

### 7. Voice Commands
- [ ] Say: "open settings"
- [ ] App navigates to settings page
- [ ] Command appears in history
- [ ] Say: "go back"
- [ ] App navigates back
- [ ] Command appears in history

### 8. WebSocket Connection (if configured)
- [ ] Check browser console for WebSocket connection status
- [ ] WebSocket connects successfully (if `VITE_WEBSOCKET_URL` is set)
- [ ] No WebSocket errors in console
- [ ] Connection status indicator shows "connected" (if displayed)

---

## 📱 Navigation & Pages

### 9. Home Page
- [ ] Home page loads correctly
- [ ] All components render without errors
- [ ] Voice status indicator shows correct state
- [ ] Command history displays (if any)

### 10. Settings Page
- [ ] Navigate to `/settings`
- [ ] Settings page loads
- [ ] All settings options are visible
- [ ] Can change settings (wake phrase, voice feedback, etc.)
- [ ] Settings persist after page refresh

### 11. Routines Page
- [ ] Navigate to `/routines`
- [ ] Routines page loads
- [ ] Can view existing routines (if any)
- [ ] Can create new routine
- [ ] Can edit routine
- [ ] Can delete routine

### 12. Command Log Page
- [ ] Navigate to `/commands` or `/command-log`
- [ ] Command log page loads
- [ ] Command history displays correctly
- [ ] Can clear command history
- [ ] History updates after new commands

---

## 🔧 Error Handling

### 13. Error Scenarios
- [ ] Disconnect internet connection
- [ ] App shows appropriate error message (if implemented)
- [ ] Reconnect internet
- [ ] App recovers gracefully
- [ ] Trigger an error (e.g., invalid action)
- [ ] Error boundary catches error (if applicable)
- [ ] User sees friendly error message

### 14. Console Errors
- [ ] Open browser DevTools (F12)
- [ ] Check Console tab
- [ ] No red errors (warnings are acceptable)
- [ ] No "Failed to fetch" errors
- [ ] No CORS errors
- [ ] No authentication errors

---

## 🔒 Security

### 15. Security Headers
- [ ] Open DevTools → Network tab
- [ ] Reload page
- [ ] Check response headers for:
  - [ ] `X-Content-Type-Options: nosniff`
  - [ ] `X-Frame-Options: DENY`
  - [ ] `X-XSS-Protection: 1; mode=block`
  - [ ] `Content-Security-Policy` header present

### 16. Authentication Security
- [ ] Cannot access protected routes without authentication
- [ ] Session expires appropriately (if configured)
- [ ] No sensitive data in console logs
- [ ] No API keys exposed in client-side code

---

## 📊 Performance

### 17. Load Time
- [ ] Page loads in < 3 seconds
- [ ] No long-running scripts blocking UI
- [ ] Images load correctly
- [ ] No layout shift (CLS) issues

### 18. Network Requests
- [ ] Open DevTools → Network tab
- [ ] Reload page
- [ ] All API requests return 200/201 status
- [ ] No failed requests (404, 500, etc.)
- [ ] Supabase requests succeed

---

## 🎨 UI/UX

### 19. Responsive Design
- [ ] Test on desktop (1920x1080)
- [ ] Test on tablet (768x1024)
- [ ] Test on mobile (375x667)
- [ ] All pages are responsive
- [ ] No horizontal scrolling on mobile
- [ ] Touch targets are appropriately sized

### 20. Accessibility
- [ ] Keyboard navigation works
- [ ] Focus indicators are visible
- [ ] Screen reader compatible (if tested)
- [ ] Color contrast is sufficient

---

## 📝 Post-Deployment

### 21. Monitoring
- [ ] Check error tracking service (if configured)
- [ ] Check analytics (if configured)
- [ ] Monitor Supabase dashboard for errors
- [ ] Check deployment logs for errors

### 22. Documentation
- [ ] Update deployment URL in documentation
- [ ] Document any issues found
- [ ] Update environment variable documentation if needed

---

## 🐛 Known Issues

List any issues found during smoke testing:

1. 
2. 
3. 

---

## ✅ Sign-Off

- **Tester:** ________________
- **Date:** ________________
- **Status:** ☐ Pass  ☐ Fail  ☐ Needs Fix
- **Notes:** 

---

## 📋 Quick Test Script

```bash
# 1. Build locally
npm run build

# 2. Test production build locally
npm run preview

# 3. Check for console errors
# Open browser DevTools (F12) → Console

# 4. Test authentication
# - Sign up with test account
# - Sign out
# - Sign in
# - Verify session persists

# 5. Test voice features
# - Click microphone
# - Allow microphone permission
# - Speak a command
# - Verify command appears in history

# 6. Test navigation
# - Navigate to all pages
# - Verify no 404 errors
# - Verify protected routes work
```

---

**Status:** Ready for production deployment ✅

