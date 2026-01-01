# Runtime Errors Check

This document tracks potential runtime errors and their fixes.

## Verified Fixes

### 1. QueryClient URL Construction ✅
- **Issue**: `queryKey.join("/")` could create incorrect URLs
- **Fix**: Added URL normalization with leading slash handling
- **Location**: `client/src/lib/queryClient.ts`

### 2. Array Default Values ✅
- **Issue**: Potential undefined array operations
- **Fix**: All queries use default empty arrays: `data: items = []`
- **Locations**:
  - `CommandHistory.tsx`: `commandHistory = []`
  - `RoutinesCard.tsx`: `routines = []`

### 3. Null Safety in Auth ✅
- **Issue**: Potential null/undefined access in auth state
- **Fix**: Proper null coalescing: `session?.user ?? null`
- **Location**: `client/src/hooks/use-auth.ts`

### 4. Supabase Client Initialization ✅
- **Issue**: Missing env vars could cause crashes
- **Fix**: Graceful fallback with placeholder client
- **Location**: `client/src/lib/supabase.ts`

### 5. WebSocket Connection ✅
- **Issue**: Missing URL validation and error handling
- **Fix**: URL validation, reconnection logic, error handling
- **Location**: `client/src/hooks/use-websocket.ts`

### 6. Speech Recognition Error Handling ✅
- **Issue**: Missing error handling for permission denied
- **Fix**: Proper error handling with permission state
- **Location**: `client/src/hooks/use-speech-recognition.ts`

## Browser Console Checks

When testing, verify:
- [ ] No undefined/null errors in console
- [ ] API requests include auth headers
- [ ] WebSocket connects successfully
- [ ] Auth modal appears when not authenticated
- [ ] Speech recognition requests permission properly
- [ ] Error toasts display correctly
- [ ] Loading states work properly

## Common Runtime Issues to Watch

1. **CORS Errors**: Ensure backend allows frontend origin
2. **Auth Token Expiry**: Supabase auto-refreshes, but watch for 401s
3. **WebSocket Reconnection**: Should reconnect automatically
4. **Speech API**: Requires HTTPS in production (except localhost)

## Testing Checklist

- [x] TypeScript compilation passes
- [x] Build completes successfully
- [x] Default values prevent undefined errors
- [x] Null checks in place
- [x] Error boundaries would be beneficial (future enhancement)

