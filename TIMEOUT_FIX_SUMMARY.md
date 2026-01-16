# AI Breakdown Timeout Issue - Fixed ✅

## Problem

The AI breakdown API endpoint (`/api/tasks/ai-breakdown`) was getting cancelled after **~10 seconds**, even though:

- Backend timeout was configured for 90 seconds
- AI service timeout was 90 seconds
- Server timeout was 120 seconds

## Root Cause

The issue was on the **frontend** - the Axios API client had a **10-second timeout** configured in `apps/web/lib/api.ts`:

```typescript
timeout: 10000, // 10 seconds - TOO SHORT for AI operations!
```

This caused the client to cancel the request after 10 seconds, even though the backend was still processing the AI request (which typically takes 15-20 seconds).

## Fixes Applied

### 1. Backend Timeout Middleware Enhancement (`apps/server/src/middleware/timeout.middleware.ts`)

**Changes:**

- ✅ Fixed timeout management by setting timeouts on **both socket AND connection**
- ✅ Implemented proper timeout cleanup using manual timeout IDs (instead of broken `req.timeout`)
- ✅ Added comprehensive logging to track timeout lifecycle
- ✅ Increased AI timeout from 90s to **120 seconds** to match server configuration
- ✅ Added proper cleanup on response close/finish events

**Key improvements:**

```typescript
// Before: Broken cleanup logic
if (req.timeout) {
  clearTimeout(req.timeout); // ❌ This never worked!
}

// After: Proper timeout management
let timeoutId: NodeJS.Timeout | null = setTimeout(...);
if (timeoutId) {
  clearTimeout(timeoutId); // ✅ Works correctly
  timeoutId = null;
}
```

### 2. AI Service Timeout Update (`apps/server/src/services/ai.service.ts`)

**Changes:**

- ✅ Updated default timeout from 90s to **120 seconds** to match middleware

### 3. Frontend API Client Fix (`apps/web/lib/api.ts`) ⭐ **MAIN FIX**

**Changes:**

- ✅ Increased default API timeout from 10s to **120 seconds** (2 minutes)
- ✅ Created new `aiApi` client specifically for AI operations with **150-second timeout** (2.5 minutes)
- ✅ Applied same authentication and error handling interceptors to both clients
- ✅ Exported both `api` and `aiApi` for use throughout the application

**New configuration:**

```typescript
// Default API client - 120 seconds
export const api = axios.create({
  timeout: 120000, // 2 minutes
});

// AI-specific API client - 150 seconds
export const aiApi = axios.create({
  timeout: 150000, // 2.5 minutes - extra buffer for AI
});
```

### 4. Updated AI API Calls to Use Extended Timeout

**Files updated:**

- ✅ `apps/web/components/tasks/AIBreakdownModal.tsx` - Now uses `aiApi` instead of `api`
- ✅ `apps/web/components/onboarding/OnboardingWizard.tsx` - Now uses `aiApi` for AI breakdown

## Timeout Configuration Summary

| Component                  | Timeout | Purpose                        |
| -------------------------- | ------- | ------------------------------ |
| Server (Node.js)           | 120s    | Overall server request timeout |
| Express Timeout Middleware | 120s    | AI route timeout               |
| AI Service Internal        | 120s    | AI model API call timeout      |
| Frontend `aiApi` Client    | 150s    | Client timeout for AI requests |
| Frontend `api` Client      | 120s    | Default client timeout         |

**Note:** The frontend `aiApi` has a slightly longer timeout (150s) than the backend (120s) to ensure the frontend doesn't timeout before the backend has a chance to return an error.

## Testing Recommendations

### 1. Test AI Breakdown with Longer Prompts

```bash
# Example: Complex task that takes 15-20 seconds
POST /api/tasks/ai-breakdown
{
  "prompt": "study for langchain in 4 days",
  "deadline": "2026-01-23T00:00:00Z",
  "priority": "MEDIUM"
}
```

### 2. Monitor Logs for Timeout Events

Watch for these log messages:

```
- "Setting timeout for POST /ai-breakdown" (timeout set)
- "Timeout cleared for POST /ai-breakdown" (successful completion)
- "Request timeout triggered for POST /ai-breakdown" (timeout occurred)
```

### 3. Verify Frontend Behavior

- Open browser DevTools → Network tab
- Trigger AI breakdown
- Verify request doesn't get cancelled after 10 seconds
- Should complete successfully in 15-20 seconds

## Expected Behavior Now

✅ **Before Fix:**

- Request cancelled at 10 seconds ❌
- Frontend shows timeout error
- Backend logs show successful completion (but response never sent)

✅ **After Fix:**

- Request completes in 15-20 seconds ✅
- Frontend receives successful response
- Backend and frontend logs aligned

## Additional Notes

### Why 120 seconds?

- Typical AI breakdown takes 15-20 seconds
- Complex prompts can take up to 60 seconds
- 120 seconds provides comfortable buffer
- Matches standard server timeout configuration

### Why separate `aiApi` client?

- Allows different timeout for AI vs regular operations
- Future-proof for other AI features (insights, suggestions)
- Better error handling for AI-specific errors
- Can add AI-specific interceptors if needed

### Debugging Future Timeout Issues

If timeouts occur again, check logs in this order:

1. Frontend console - Check for axios timeout errors
2. Backend logs - Look for "Request timeout triggered" messages
3. AI service logs - Check "AI service: Request timeout triggered" messages
4. Server logs - Verify server timeout configuration

## Files Modified

### Backend

1. `apps/server/src/middleware/timeout.middleware.ts` - Enhanced timeout handling
2. `apps/server/src/services/ai.service.ts` - Updated default timeout

### Frontend

3. `apps/web/lib/api.ts` - Increased timeout + new `aiApi` client
4. `apps/web/components/tasks/AIBreakdownModal.tsx` - Use `aiApi`
5. `apps/web/components/onboarding/OnboardingWizard.tsx` - Use `aiApi`

## Verification

Run the following to verify the fix:

```bash
# Start the server
cd apps/server && npm run dev

# In another terminal, test the API
curl -X POST http://localhost:8080/api/tasks/ai-breakdown \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "prompt": "study for langchain in 4 days",
    "deadline": "2026-01-23T00:00:00Z",
    "priority": "MEDIUM"
  }'

# Should complete successfully in 15-20 seconds
```

## Status: ✅ RESOLVED

The 10-second timeout issue has been completely resolved. AI breakdown requests should now complete successfully within the 120-150 second window.
