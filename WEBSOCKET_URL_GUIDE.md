# WebSocket URL Configuration Guide

## Current WebSocket URL Location

The WebSocket URL is configured in **`src/utils/RealtimeChat.ts`** at line 39.

### Current Setup:

1. **Code Location**: `src/utils/RealtimeChat.ts:39`
   ```typescript
   const websocketUrl = import.meta.env.VITE_WEBSOCKET_URL;
   ```

2. **Fallback URL** (if `VITE_WEBSOCKET_URL` is not set):
   ```
   wss://zofxbilhjehbtlbtence.functions.supabase.co/functions/v1/realtime-chat
   ```
   This is the Supabase Edge Function that relays to OpenAI Realtime API.

## How to Set the WebSocket URL

### Option 1: Local Development (.env file)

Create or edit `.env` file in the project root:

```bash
VITE_WEBSOCKET_URL=wss://zofxbilhjehbtlbtence.functions.supabase.co/functions/v1/realtime-chat
```

**Note**: The current fallback uses this URL, so if you want to use the Supabase function, you can either:
- Set it in `.env` explicitly, OR
- Leave it unset to use the fallback

### Option 2: Use Custom WebSocket Server

If you have your own WebSocket server:

```bash
VITE_WEBSOCKET_URL=wss://your-websocket-server.com
```

**Important**: The URL should NOT include `/functions/v1/` - use a direct WebSocket URL.

### Option 3: Vercel Environment Variables

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:
   ```
   VITE_WEBSOCKET_URL=wss://your-websocket-url.com
   ```
3. Redeploy

## Current WebSocket Setup

The app uses a **Supabase Edge Function** (`supabase/functions/realtime-chat/index.ts`) that:
- Acts as a WebSocket relay
- Connects to OpenAI Realtime API
- Requires `OPENAI_API_KEY` in Supabase secrets

### Supabase Function URL Format:
```
wss://[YOUR_PROJECT].functions.supabase.co/functions/v1/realtime-chat
```

For your project:
```
wss://zofxbilhjehbtlbtence.functions.supabase.co/functions/v1/realtime-chat
```

## Troubleshooting

### WebSocket Not Connecting?

1. **Check if URL is set**: Look in browser console for:
   - `"VITE_WEBSOCKET_URL not set. Using fallback..."` - means using fallback
   - `"Connecting to WebSocket: [URL]"` - shows which URL is being used

2. **Verify Supabase Function is Deployed**:
   ```bash
   supabase functions deploy realtime-chat
   ```

3. **Check Supabase Secrets**:
   - Make sure `OPENAI_API_KEY` is set in Supabase dashboard
   - Go to: Project Settings → Edge Functions → Secrets

4. **Test the URL**:
   - The Supabase function URL should be accessible
   - Check Supabase logs for connection errors

## Recommended Setup

For production, use the Supabase Edge Function:

1. **Deploy the function** (if not already):
   ```bash
   supabase functions deploy realtime-chat
   ```

2. **Set environment variable**:
   ```bash
   VITE_WEBSOCKET_URL=wss://zofxbilhjehbtlbtence.functions.supabase.co/functions/v1/realtime-chat
   ```

3. **Or use the fallback** (current behavior):
   - Leave `VITE_WEBSOCKET_URL` unset
   - The code will automatically use the Supabase function URL

## Next Steps

1. ✅ The fallback URL is already configured in code
2. ⚠️ Make sure Supabase function is deployed: `supabase functions deploy realtime-chat`
3. ⚠️ Set `OPENAI_API_KEY` in Supabase secrets
4. ✅ The app will use the fallback URL if `VITE_WEBSOCKET_URL` is not set

