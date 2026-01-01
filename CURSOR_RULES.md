# CURSOR_RULES.md

## Step 1: Dev + Build Commands

### How to Run Dev
```bash
npm run dev
```
Command: `set NODE_ENV=development && tsx server/index.ts`
- Sets NODE_ENV to development
- Starts the server using tsx
- Serves on port 5000 (or PORT env var)

### How to Run Build
```bash
npm run build
```
Command: `vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist`
- Builds the frontend with Vite
- Bundles the server code with esbuild
- Outputs to `dist/` directory

## Top 5 Blockers Preventing Definition of Done (Priority Order)

1. ✅ **QueryClient URL Construction Issue**: FIXED - Improved URL normalization to handle queryKey arrays properly
2. ✅ **Missing Supabase Auth Implementation**: FIXED - Full Supabase auth implementation with login/signup, protected routes, and auth headers
3. ✅ **Missing WebSocket Implementation**: FIXED - WebSocket hook using VITE_WEBSOCKET_URL with validation to prevent functions/v1 URLs
4. ✅ **Missing Environment Variables**: FIXED - .env.example updated with VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, and VITE_WEBSOCKET_URL
5. ✅ **Runtime Errors Not Identified**: FIXED - Code reviewed for potential runtime errors, default values added, null checks in place

## Step 7: Vercel Deployment Steps

See `VERCEL_DEPLOYMENT.md` for complete deployment instructions.

### Quick Deploy:
1. Connect Git repository to Vercel
2. Build command: `npm run build` (auto-detected)
3. Output directory: `dist/public` (configured in vercel.json)
4. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_WEBSOCKET_URL`
   - `VITE_API_URL` (if backend is separate)
5. Deploy!

**Status**: ✅ Ready for Vercel deployment

