# BuildShip Integration Setup

This document explains how to set up and configure BuildShip for voice command processing in SpeakEasy.

## Overview

BuildShip is integrated as a backend service to process voice commands intelligently. It provides:
- Intent recognition (OPEN_SETTINGS, GO_HOME, START_ROUTINE, etc.)
- Entity extraction (routine names, notes, etc.)
- Context-aware responses
- Client action execution (navigation, routine execution, note saving)

## BuildShip Workflow Configuration

### Workflow Name
`speakeasy_process_command`

### Trigger
**REST API Call / HTTP Endpoint** (entry node)

### Request Schema
```json
{
  "user_id": "uuid",
  "session_id": "string",
  "transcript": "string",
  "context": {
    "screen": "Home|Settings|Routines|etc",
    "timezone": "America/New_York",
    "app_mode": "web|mobile",
    "recent_commands": ["..."]
  }
}
```

### Response Schema (Strict)
```json
{
  "intent": "OPEN_SETTINGS|GO_HOME|OPEN_ROUTINES|START_ROUTINE|STOP_LISTENING|START_LISTENING|SHOW_COMMAND_LOG|LOG_NOTE|WHAT_CAN_YOU_DO|HELP|SIGN_OUT|UNKNOWN",
  "confidence": 0.0,
  "entities": {
    "routine_name": "string|null",
    "note": "string|null"
  },
  "assistant_reply": "string",
  "client_action": {
    "type": "NAVIGATE|RUN_ROUTINE|SAVE_NOTE|NONE",
    "payload": {}
  }
}
```

## Command Catalog

The following 12 commands are supported:

1. **OPEN_SETTINGS** - Navigate to settings page
2. **GO_HOME** - Navigate to home page
3. **OPEN_ROUTINES** - Navigate to routines page
4. **START_ROUTINE** - Execute a routine (requires `routine_name` entity)
5. **STOP_LISTENING** - Stop voice recognition
6. **START_LISTENING** - Start voice recognition
7. **SHOW_COMMAND_LOG** - Navigate to command history
8. **LOG_NOTE** - Save a note (requires `note` entity)
9. **WHAT_CAN_YOU_DO** - Show available commands
10. **HELP** - Show help information
11. **SIGN_OUT** - Sign out the user
12. **UNKNOWN** - Fallback for unrecognized commands

## Environment Setup

### 1. Get BuildShip API URL

1. Go to [BuildShip](https://buildship.com)
2. Create or open your `speakeasy_process_command` workflow
3. Copy the REST API endpoint URL from the trigger node
4. The URL should look like: `https://api.buildship.com/v1/workflows/your-workflow-id/trigger`

### 2. Add to Environment Variables

Add the BuildShip API URL to your environment variables:

**For local development:**
Create or update `.env`:
```env
VITE_BUILDSHIP_API_URL=https://api.buildship.com/v1/workflows/your-workflow-id/trigger
```

**For Vercel deployment:**
1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add:
   - **Name**: `VITE_BUILDSHIP_API_URL`
   - **Value**: Your BuildShip API URL
   - **Environment**: Production, Preview, Development (as needed)

### 3. Update .env.example

The `.env.example` file should include:
```env
VITE_BUILDSHIP_API_URL=https://api.buildship.com/v1/workflows/your-workflow-id/trigger
```

## How It Works

### Command Processing Flow

1. **User speaks a command** → Voice recognition captures transcript
2. **System command check** → First checks if it's a native system command (scroll, navigate, etc.)
3. **BuildShip processing** → If not a system command, sends to BuildShip API
4. **Intent recognition** → BuildShip returns intent, confidence, entities, and actions
5. **Client action execution** → App executes the appropriate action:
   - **NAVIGATE**: Changes route (e.g., `/settings`, `/routines`)
   - **RUN_ROUTINE**: Executes a routine by name
   - **SAVE_NOTE**: Saves a note to the database
   - **NONE**: Just shows the assistant reply
6. **Fallback** → If BuildShip is unavailable, uses local command processing

### Session Management

- Each user session gets a unique `session_id`
- Session ID persists across page reloads (stored in `sessionStorage`)
- Session ID is included in every BuildShip API request for context

### Context Information

BuildShip receives:
- **Current screen**: Extracted from React Router pathname
- **Timezone**: Automatically detected from browser
- **App mode**: `web` or `mobile` (based on Capacitor detection)
- **Recent commands**: Last 5 commands for context

## BuildShip Workflow Implementation Tips

### Intent Recognition

Use AI (OpenAI, Anthropic, etc.) or pattern matching to:
1. Parse the transcript
2. Identify the intent from the 12 supported commands
3. Extract entities (routine names, notes, etc.)
4. Calculate confidence score (0.0 - 1.0)

### Entity Extraction

Extract:
- **routine_name**: When intent is `START_ROUTINE`
- **note**: When intent is `LOG_NOTE`

### Assistant Reply

Provide a natural language response:
- High confidence (>0.7): "Opening settings now"
- Medium confidence (0.5-0.7): "I think you want to open settings. Is that correct?"
- Low confidence (<0.5): "I didn't understand that command. Try saying 'open settings' or 'go home'"

### Client Actions

Return appropriate action type:
- **NAVIGATE**: For screen navigation
- **RUN_ROUTINE**: For routine execution
- **SAVE_NOTE**: For note saving
- **NONE**: For informational responses (HELP, WHAT_CAN_YOU_DO)

## Testing

### Test Without BuildShip

If `VITE_BUILDSHIP_API_URL` is not set, the app automatically falls back to local command processing.

### Test With BuildShip

1. Set `VITE_BUILDSHIP_API_URL` in your `.env`
2. Start the app: `npm run dev`
3. Click the microphone button
4. Say a command like "open settings" or "go home"
5. Check the browser console for BuildShip API logs
6. Verify the command is processed correctly

### Debugging

Check browser console for:
- `📤 Sending command to BuildShip:` - Request being sent
- `✅ BuildShip response received:` - Response received
- `❌ BuildShip API call failed:` - Error occurred
- `🔄 Using fallback command processing` - BuildShip unavailable, using fallback

## Troubleshooting

### BuildShip Not Responding

1. **Check API URL**: Verify `VITE_BUILDSHIP_API_URL` is correct
2. **Check CORS**: Ensure BuildShip allows requests from your domain
3. **Check Network**: Open browser DevTools → Network tab → Look for failed requests
4. **Check Logs**: Look for error messages in browser console

### Commands Not Working

1. **Check Intent**: Verify BuildShip returns one of the 12 supported intents
2. **Check Confidence**: Low confidence (<0.5) may cause issues
3. **Check Action Type**: Verify `client_action.type` is one of: `NAVIGATE`, `RUN_ROUTINE`, `SAVE_NOTE`, `NONE`
4. **Check Fallback**: If BuildShip fails, fallback should still work

### Session ID Issues

- Session ID is automatically generated and stored
- To reset: Clear browser `sessionStorage` or restart browser
- Session ID format: `session_{timestamp}_{random}`

## Next Steps

1. **Implement Routine Execution**: Complete the `handleRunRoutineAction` function to fetch and execute routines from the database
2. **Implement Note Saving**: Complete the `handleSaveNoteAction` function to save notes to the database
3. **Add More Commands**: Extend the command catalog in BuildShip workflow
4. **Improve Intent Recognition**: Train BuildShip workflow with more examples for better accuracy

## Support

For BuildShip-specific issues, refer to [BuildShip Documentation](https://docs.buildship.com).

For app-specific issues, check the browser console logs and verify environment variables are set correctly.

