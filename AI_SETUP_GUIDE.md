# Connecting the AI - SpeakEasy Voice Control Setup Guide

## 🤖 Overview

SpeakEasy uses **OpenAI's Realtime API** for advanced voice conversations and Supabase for backend services. Here's what you need to connect:

---

## 🔑 Required API Keys & Services

### 1. **OpenAI API Key** (Required for AI Voice)
**Purpose:** Powers the real-time voice AI conversation feature

**Get Your Key:**
1. Go to [OpenAI Platform](https://platform.openai.com)
2. Sign up or log in
3. Navigate to [API Keys](https://platform.openai.com/api-keys)
4. Click "Create new secret key"
5. Copy the key (starts with `sk-`)

**Cost:** Pay-as-you-go
- Realtime API: ~$0.06/minute for audio input + ~$0.24/minute for audio output
- GPT-4 Realtime model pricing applies

**Your Current Status:** ✅ Already configured in `.env`

---

### 2. **Supabase Project** (Required for Backend)
**Purpose:** Authentication, database, and edge functions proxy

**Get Your Credentials:**
1. Go to [Supabase](https://supabase.com)
2. Create a new project (or use existing)
3. Go to Project Settings > API
4. Copy:
   - Project URL
   - Project ID (from URL)
   - `anon` public key

**Cost:** Free tier available (50,000 monthly active users)

**Your Current Status:** ✅ Already configured

---

## 📝 Configuration Files

### Your `.env` File (Current Configuration)

```dotenv
# Supabase Configuration
VITE_SUPABASE_PROJECT_ID="zofxbilhjehbtlbtence"
VITE_SUPABASE_URL="https://zofxbilhjehbtlbtence.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# API Endpoints
VITE_BACKEND_URL="http://api.myspeakeasy.digital"
VITE_API_URL="https://api.myspeakeasy.digital"
VITE_SUPABASE_FUNCTIONS_URL="https://zofxbilhjehbtlbtence.functions.supabase.co"

# OpenAI API Key (for Supabase Edge Function)
OPENAI_API_KEY=your_openai_api_key_here
```

**✅ Status:** All keys are present and configured!

---

## 🔧 Supabase Setup (Required)

### Step 1: Deploy Edge Function
The OpenAI Realtime API requires a WebSocket proxy. SpeakEasy uses a Supabase Edge Function.

```powershell
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref zofxbilhjehbtlbtence

# Deploy the realtime-chat function
supabase functions deploy realtime-chat

# Set the OpenAI API key as a secret
supabase secrets set OPENAI_API_KEY=your-openai-key-here
```

### Step 2: Verify Edge Function
```powershell
# Test if function is deployed
supabase functions list

# Expected output:
# realtime-chat (deployed)
```

---

## 🧪 Testing the AI Connection

### Test 1: Verify OpenAI Key Works
```powershell
# Run the test script
node test-openai.js
```

**Expected Output:**
```
✅ OpenAI API key is valid
Available models include GPT-4...
```

### Test 2: Test Supabase Edge Function
```powershell
# Test WebSocket connection to Supabase function
node test-supabase-secret.js
```

**Expected Output:**
```
✅ Connected to Supabase Edge Function
✅ OpenAI connection established
```

### Test 3: Test in App
```powershell
# Start dev server
npm run dev
```

Then in the app:
1. Sign in/up
2. Navigate to voice chat interface
3. Click "Connect to AI Assistant"
4. Should see: "AI Voice Assistant Connected"
5. Speak and the AI should respond

---

## 🔍 Architecture - How It Works

```
┌─────────────┐         ┌──────────────────┐         ┌─────────────┐
│             │         │                  │         │             │
│  SpeakEasy  │ ◄─────► │ Supabase Edge    │ ◄─────► │  OpenAI     │
│  Web/Mobile │         │ Function (Proxy) │         │  Realtime   │
│  App        │         │                  │         │  API        │
│             │         │                  │         │             │
└─────────────┘         └──────────────────┘         └─────────────┘
     (You)              (Your Supabase)              (OpenAI Cloud)
```

**Why this architecture?**
- **Browser security:** Can't directly connect to OpenAI from browser (CORS, key security)
- **Key protection:** OpenAI API key stored securely in Supabase, not exposed to client
- **WebSocket proxy:** Supabase Edge Function acts as secure middleman

---

## 🚨 Troubleshooting

### Issue: "Not connected to AI assistant"

**Possible causes:**
1. **Edge function not deployed**
   ```powershell
   supabase functions deploy realtime-chat
   ```

2. **OpenAI key not set in Supabase**
   ```powershell
   supabase secrets set OPENAI_API_KEY=sk-your-key-here
   ```

3. **Wrong function URL**
   - Check `.env` file has correct `VITE_SUPABASE_FUNCTIONS_URL`
   - Should match your Supabase project

### Issue: "OpenAI API key not found"

**Solution:** Set the key as a Supabase secret (not just in local .env)
```powershell
supabase secrets set OPENAI_API_KEY=sk-your-actual-key-here
```

### Issue: "Failed to connect to realtime chat"

**Check:**
1. Internet connection
2. OpenAI API key has available credits
3. Supabase project is active (not paused)
4. Check browser console for detailed errors

```powershell
# View Supabase function logs
supabase functions logs realtime-chat
```

### Issue: "Insufficient funds" or "Rate limit"

**Solutions:**
- Add credits to OpenAI account: https://platform.openai.com/account/billing
- Check usage: https://platform.openai.com/usage
- Ensure you're on a paid plan (Realtime API requires it)

---

## 💰 Cost Management

### OpenAI Realtime API Costs
- **Input Audio:** ~$0.06 per minute
- **Output Audio:** ~$0.24 per minute
- **Text only:** Much cheaper (~$0.01 per 1K tokens)

### Example Monthly Costs
- **Light usage** (10 min/day): ~$90/month
- **Moderate** (30 min/day): ~$270/month
- **Heavy** (2 hours/day): ~$1,080/month

### Cost Saving Tips
1. Use text commands instead of continuous voice chat when possible
2. Implement session timeouts (disconnect after inactivity)
3. Set usage limits in OpenAI dashboard
4. Monitor usage regularly

---

## 🔐 Security Best Practices

### ✅ DO:
- Keep `.env` file in `.gitignore` (already done)
- Use Supabase secrets for production keys
- Rotate API keys periodically
- Monitor API usage for anomalies
- Use environment variables for all keys

### ❌ DON'T:
- Commit `.env` to Git
- Share API keys publicly
- Use same key across multiple projects
- Expose keys in client-side code
- Use admin keys where public keys work

---

## 🚀 Quick Setup Checklist

- [x] OpenAI API key obtained
- [x] Supabase project created
- [x] Local `.env` file configured
- [ ] Supabase CLI installed
- [ ] Linked to Supabase project
- [ ] Edge function deployed
- [ ] OpenAI key set as Supabase secret
- [ ] Tested connection locally
- [ ] Verified AI voice works in app

---

## 📚 Additional Resources

### OpenAI
- [Realtime API Documentation](https://platform.openai.com/docs/guides/realtime)
- [API Keys Management](https://platform.openai.com/api-keys)
- [Pricing](https://openai.com/api/pricing/)
- [Usage Dashboard](https://platform.openai.com/usage)

### Supabase
- [Edge Functions Guide](https://supabase.com/docs/guides/functions)
- [CLI Documentation](https://supabase.com/docs/reference/cli)
- [Secrets Management](https://supabase.com/docs/guides/functions/secrets)

### Your Project Files
- Edge Function: [supabase/functions/realtime-chat/index.ts](supabase/functions/realtime-chat/index.ts)
- React Hook: [src/hooks/useRealtimeChat.ts](src/hooks/useRealtimeChat.ts)
- Test Scripts: `test-openai.js`, `test-supabase-secret.js`

---

## 🎯 Next Steps

1. **Install Supabase CLI** (if not already)
   ```powershell
   npm install -g supabase
   ```

2. **Deploy Edge Function**
   ```powershell
   supabase login
   supabase link --project-ref zofxbilhjehbtlbtence
   supabase functions deploy realtime-chat
   supabase secrets set OPENAI_API_KEY=your-key-here
   ```

3. **Test the Connection**
   ```powershell
   npm run dev
   # Test AI voice in the app
   ```

4. **Done!** Your AI is connected 🎉

---

**Need help?** Check the troubleshooting section above or review the Supabase/OpenAI documentation linked.
