# Simple Local AI Testing (No Deployment Needed)

## Quick Fix for Testing AI Locally

You can test the AI features locally without deploying to Supabase. This is perfect for development.

### Step 1: Start the Local Proxy

```powershell
# This runs a local WebSocket server that connects to OpenAI
node local-realtime-proxy.js
```

Keep this terminal open - it needs to stay running.

### Step 2: Update .env for Local Testing

Change one line in your `.env`:

```env
# Change this:
VITE_API_URL="https://api.myspeakeasy.digital"

# To this:
VITE_API_URL="http://localhost:8000"
```

### Step 3: Start the App

In a NEW terminal:

```powershell
npm run dev
```

### Step 4: Test in Browser

1. Open http://localhost:5173
2. Sign in/up
3. Navigate to the AI voice interface
4. Click "Connect to AI Assistant"
5. Should work now! 🎉

---

## What This Does

The `local-realtime-proxy.js` file creates a local WebSocket server that:
- Runs on your computer (localhost:8000)
- Connects to OpenAI's Realtime API
- Uses the OPENAI_API_KEY from your .env
- Acts as a bridge between your app and OpenAI

**Pros:**
- ✅ Works immediately, no deployment needed
- ✅ Perfect for testing and development
- ✅ Easy to debug (see logs in terminal)

**Cons:**
- ❌ Only works on your local machine
- ❌ Won't work for deployed/production app
- ❌ Won't work on mobile app

---

## For Production (Later)

Once you're ready for production or mobile:
1. Deploy the Supabase Edge Function (see AI_SETUP_GUIDE.md)
2. Change VITE_API_URL back to your Supabase URL
3. The app will use the cloud deployment

---

## Try This NOW:

```powershell
# Terminal 1: Start local proxy
node local-realtime-proxy.js

# Terminal 2: Start app
npm run dev
```

Then test in browser!
