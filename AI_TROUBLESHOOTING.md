# Quick Fix: AI Not Working

## The Problem

The AI voice feature requires a **Supabase Edge Function** to be deployed, which acts as a proxy between your app and OpenAI. This function isn't deployed yet.

---

## Solution Options

### Option 1: Deploy Supabase Edge Function (Recommended for Production)

**Requirements:**
- Supabase CLI installed
- Supabase account access

**Steps:**
```powershell
# Install Supabase CLI globally
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref zofxbilhjehbtlbtence

# Deploy the edge function
cd supabase/functions
supabase functions deploy realtime-chat

# Set OpenAI API key as secret
supabase secrets set OPENAI_API_KEY="your_openai_api_key_here"

# Verify deployment
supabase functions list
```

**Expected output:**
```
realtime-chat (deployed) ✓
```

---

### Option 2: Use Local Proxy (For Development/Testing)

**Quick setup for testing without Supabase deployment:**

```powershell
# Run the local proxy server
node local-realtime-proxy.js
```

Then update `.env` to use local proxy:
```env
VITE_API_URL="http://localhost:8000"
```

**Note:** This only works for local testing, not on deployed apps.

---

### Option 3: Disable AI Voice (Use Basic Voice Commands Only)

If you just want to test the basic voice commands without the AI conversation feature:

**In the app:**
- Don't click "Connect to AI Assistant"
- Use wake phrases and basic commands: "Hey SpeakEasy, open camera"
- These work without the AI connection

---

## Diagnosing the Specific Error

### Check 1: Is Supabase CLI installed?
```powershell
supabase --version
```

**If not found:**
```powershell
npm install -g supabase
```

### Check 2: Can you access Supabase?
```powershell
supabase login
```

**If login fails:**
- Check your internet connection
- Verify Supabase account credentials
- Try: https://app.supabase.com

### Check 3: Is the edge function deployed?
```powershell
supabase functions list --project-ref zofxbilhjehbtlbtence
```

**If empty or error:**
- The function needs to be deployed (see Option 1)

### Check 4: Is OpenAI key valid?
```powershell
# Set environment variable and test
$env:OPENAI_API_KEY = "your_openai_api_key_here"
node test-openai.js
```

**Expected:** "✅ OpenAI API key is valid"

---

## Common Error Messages & Fixes

### "Failed to connect to realtime chat"
**Cause:** Edge function not deployed  
**Fix:** Deploy edge function (Option 1)

### "WebSocket connection failed"
**Cause:** Wrong URL or function not deployed  
**Fix:** Check VITE_API_URL in .env, deploy function

### "OpenAI API key not found"
**Cause:** Secret not set in Supabase  
**Fix:** `supabase secrets set OPENAI_API_KEY=your-key`

### "401 Unauthorized" 
**Cause:** Invalid or expired OpenAI API key  
**Fix:** Get new key from OpenAI platform, update in Supabase secrets

### "Insufficient quota" or "Rate limit"
**Cause:** OpenAI account has no credits or reached limit  
**Fix:** Add payment method and credits at https://platform.openai.com/account/billing

---

## Quick Test Script

Run this to diagnose what's wrong:

```powershell
Write-Host "🔍 Diagnosing AI Connection Issues" -ForegroundColor Cyan
Write-Host ""

# Test 1: Check if Supabase CLI is installed
Write-Host "Test 1: Supabase CLI" -ForegroundColor Yellow
$supabase = Get-Command supabase -ErrorAction SilentlyContinue
if ($supabase) {
    Write-Host "  ✓ Supabase CLI installed: $($supabase.Version)" -ForegroundColor Green
} else {
    Write-Host "  ✗ Supabase CLI not found" -ForegroundColor Red
    Write-Host "    Install: npm install -g supabase" -ForegroundColor Gray
}

# Test 2: Check OpenAI key
Write-Host ""
Write-Host "Test 2: OpenAI API Key" -ForegroundColor Yellow
$env:OPENAI_API_KEY = (Get-Content .env | Select-String "OPENAI_API_KEY" | ForEach-Object { $_ -replace 'OPENAI_API_KEY=','' })
if ($env:OPENAI_API_KEY) {
    Write-Host "  ✓ Key found in .env" -ForegroundColor Green
} else {
    Write-Host "  ✗ Key not found in .env" -ForegroundColor Red
}

# Test 3: Check .env configuration
Write-Host ""
Write-Host "Test 3: Environment Configuration" -ForegroundColor Yellow
$apiUrl = Get-Content .env | Select-String "VITE_API_URL"
if ($apiUrl) {
    Write-Host "  ✓ API URL configured: $apiUrl" -ForegroundColor Green
} else {
    Write-Host "  ⚠ API URL not set" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. If Supabase CLI missing: npm install -g supabase" -ForegroundColor White
Write-Host "2. Deploy edge function: supabase functions deploy realtime-chat" -ForegroundColor White
Write-Host "3. Set OpenAI secret: supabase secrets set OPENAI_API_KEY=..." -ForegroundColor White
Write-Host "4. Test in app: npm run dev" -ForegroundColor White
```

Save this as `scripts/diagnose-ai.ps1` and run it.

---

## What You Need To Do NOW

**Most likely, you just need to:**

```powershell
# Step 1: Install Supabase CLI
npm install -g supabase

# Step 2: Deploy the function
supabase login
supabase functions deploy realtime-chat --project-ref zofxbilhjehbtlbtence

# Step 3: Set the API key
supabase secrets set OPENAI_API_KEY="your_openai_api_key_here"

# Step 4: Test
npm run dev
```

**Then in the app:** Click "Connect to AI Assistant" and it should work!

---

## Still Not Working?

Tell me:
1. **What specific error message** do you see?
2. **Where** does it appear? (browser console, terminal, app UI)
3. **What commands** did you run?
4. **Output** of `supabase functions list`

I'll help you fix it!
