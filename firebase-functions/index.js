// Firebase Cloud Functions for Voice Processing
const { onRequest, onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp();

async function getFetch() {
  if (typeof globalThis.fetch === 'function') return globalThis.fetch;
  const mod = await import('node-fetch');
  return mod.default;
}

function extractResponseText(data) {
  if (!data) return '';
  if (typeof data.output_text === 'string' && data.output_text.trim()) return data.output_text;
  if (typeof data.output === 'string' && data.output.trim()) return data.output;

  if (Array.isArray(data.output)) {
    for (const item of data.output) {
      if (!item) continue;
      if (typeof item === 'string' && item.trim()) return item;
      if (typeof item.content === 'string' && item.content.trim()) return item.content;
      if (Array.isArray(item.content)) {
        const textParts = item.content
          .map((c) => {
            if (!c) return '';
            if (typeof c === 'string') return c;
            if (typeof c.text === 'string') return c.text;
            return '';
          })
          .filter(Boolean);
        if (textParts.length) return textParts.join('');
      }
    }
  }

  try {
    return JSON.stringify(data);
  } catch (e) {
    return String(data);
  }
}

// OpenAI configuration (stored as a Firebase secret)
const OPENAI_API_KEY = defineSecret('OPENAI_API_KEY');

// Test connection function
exports.testConnection = onCall(async (request) => {
  console.log('Test connection called');

  try {
    return {
      success: true,
      message: 'Firebase voice service connected successfully',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Test connection error:', error);
    throw new HttpsError('internal', 'Connection test failed');
  }
});

// AI chat (callable)
exports.aiChat = onCall({ secrets: [OPENAI_API_KEY] }, async (request) => {
  const payload = request?.data || {};
  const { message, history } = payload;

  if (!message || typeof message !== 'string') {
    console.error('aiChat invalid payload keys:', Object.keys(payload || {}));
    throw new HttpsError('invalid-argument', 'Message is required');
  }

  try {
    const apiKey = OPENAI_API_KEY.value() || process.env.OPENAI_API_KEY;
    console.log('aiChat OpenAI key diagnostics:', {
      hasKey: Boolean(apiKey),
      prefix: apiKey ? String(apiKey).slice(0, 12) : null,
      length: apiKey ? String(apiKey).length : 0,
    });

    let responseText;
    if (apiKey) {
      const safeHistory = Array.isArray(history)
        ? history
            .slice(-10)
            .map((m) => {
              if (!m || typeof m !== 'object') return null;
              const role = m.role;
              const content = m.content;
              if (role !== 'user' && role !== 'assistant' && role !== 'system') return null;
              if (typeof content !== 'string' || !content.trim()) return null;
              return { role, content: content.slice(0, 2000) };
            })
            .filter(Boolean)
        : [];

      responseText = await callOpenAI(message, apiKey, safeHistory);
    } else {
      responseText = generateMockResponse(message);
    }

    return { response: responseText };
  } catch (error) {
    const msg = error && typeof error === 'object' && 'message' in error ? String(error.message) : '';
    console.error('aiChat error:', error);
    if (msg.includes('OpenAI API error: 429') || msg.includes('insufficient_quota')) {
      const fallback = generateMockResponse(message);
      return {
        response: fallback,
        fallback: true,
        reason: 'quota',
      };
    }
    throw new HttpsError('internal', 'Failed to process AI chat message', msg || undefined);
  }
});

// Process voice command with AI
exports.processVoiceCommand = onCall({ secrets: [OPENAI_API_KEY] }, async (request) => {
  const { message, userId } = request?.data || {};

  if (!message) {
    throw new HttpsError('invalid-argument', 'Message is required');
  }

  console.log('Processing voice command:', message, 'for user:', userId);

  try {
    const apiKey = OPENAI_API_KEY.value() || process.env.OPENAI_API_KEY;

    let responseText;
    if (apiKey) {
      responseText = await callOpenAI(message, apiKey);
    } else {
      responseText = generateMockResponse(message);
    }

    return { response: responseText };
  } catch (error) {
    console.error('Error processing voice command:', error);
    throw new HttpsError('internal', 'Failed to process voice command');
  }
});

// Execute voice command
exports.executeVoiceCommand = onCall(async (request) => {
  const { command, userId } = request?.data || {};

  if (!command) {
    throw new HttpsError('invalid-argument', 'Command is required');
  }

  console.log('Executing voice command:', command, 'for user:', userId);

  try {
    const action = parseCommand(command);

    if (action) {
      const executed = true; // Placeholder for real native execution
      const response = generateCommandResponse(action);

      return {
        response,
        executed,
        action: action.type,
      };
    } else {
      const response = generateMockResponse(command);
      return {
        response,
        executed: false,
      };
    }
  } catch (error) {
    console.error('Error executing voice command:', error);
    throw new HttpsError('internal', 'Failed to execute voice command');
  }
});

// Call OpenAI API (if configured)
async function callOpenAI(message, apiKey, history = []) {
  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const fetchFn = await getFetch();

  const input = [
    {
      role: "system",
      content:
        "You are a helpful AI voice assistant for the SpeakEasy app. Provide concise, practical responses. If the user gives a command, respond with the best next action.",
    },
    ...(Array.isArray(history) ? history : []),
    {
      role: "user",
      content: message,
    },
  ];

  const body = {
    model: "gpt-4o-mini",
    input,
  };

  // Retry logic for 429 errors
  for (let attempt = 1; attempt <= 3; attempt++) {
    const response = await fetchFn("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (response.status === 429 && attempt < 3) {
      console.warn(`OpenAI rate limit hit. Retrying attempt ${attempt}...`);
      await new Promise((res) => setTimeout(res, 500 * attempt));
      continue;
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(
        `OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const data = await response.json();
    const text = extractResponseText(data);
    return text || "No response from AI.";
  }

  throw new Error("OpenAI rate limit exceeded after retries.");
}

// Parse command to determine action type
function parseCommand(command) {
  const lowerCommand = command.toLowerCase().trim();

  // App opening commands
  if (lowerCommand.match(/\b(open|launch|start)\b/)) {
    const match = lowerCommand.match(/(?:open|launch|start)\s+(.+)/);
    if (match) {
      return {
        type: 'open_app',
        target: match[1].trim(),
      };
    }
  }

  // Text input commands
  if (lowerCommand.match(/\b(type|write|dictate)\b/)) {
    const match = lowerCommand.match(/(?:type|write|dictate)\s+(.+)/);
    if (match) {
      return {
        type: 'type_text',
        text: match[1].trim(),
      };
    }
  }

  // Search commands
  if (lowerCommand.match(/\b(search|google|look up)\b/)) {
    const match = lowerCommand.match(/(?:search|google|look up)\s+(.+)/);
    if (match) {
      return {
        type: 'search',
        query: match[1].trim(),
      };
    }
  }

  // Media commands
  if (lowerCommand.match(/\b(play|pause|stop|next|previous|skip)\b/)) {
    if (lowerCommand.includes('play')) return { type: 'media_control', action: 'play' };
    if (lowerCommand.includes('pause')) return { type: 'media_control', action: 'pause' };
    if (lowerCommand.includes('stop')) return { type: 'media_control', action: 'stop' };
    if (lowerCommand.includes('next') || lowerCommand.includes('skip'))
      return { type: 'media_control', action: 'next' };
    if (lowerCommand.includes('previous'))
      return { type: 'media_control', action: 'previous' };
  }

  // System commands
  if (lowerCommand.match(/\b(brightness|wifi|bluetooth|volume)\b/)) {
    if (lowerCommand.includes('brightness up'))
      return { type: 'system_action', action: 'brightness_up' };
    if (lowerCommand.includes('brightness down'))
      return { type: 'system_action', action: 'brightness_down' };
    if (lowerCommand.includes('wifi on')) return { type: 'system_action', action: 'wifi_on' };
    if (lowerCommand.includes('wifi off')) return { type: 'system_action', action: 'wifi_off' };
    if (lowerCommand.includes('bluetooth on'))
      return { type: 'system_action', action: 'bluetooth_on' };
    if (lowerCommand.includes('bluetooth off'))
      return { type: 'system_action', action: 'bluetooth_off' };
    if (lowerCommand.includes('volume up'))
      return { type: 'system_action', action: 'volume_up' };
    if (lowerCommand.includes('volume down'))
      return { type: 'system_action', action: 'volume_down' };
  }

  // Navigation commands
  if (lowerCommand.match(/\b(home|back|recent)\b/)) {
    if (lowerCommand.includes('home')) return { type: 'navigate', action: 'home' };
    if (lowerCommand.includes('back')) return { type: 'navigate', action: 'back' };
    if (lowerCommand.includes('recent'))
      return { type: 'navigate', action: 'recent_apps' };
  }

  // Action commands
  if (lowerCommand.includes('screenshot')) return { type: 'screenshot' };
  if (lowerCommand.includes('copy')) return { type: 'copy' };
  if (lowerCommand.includes('paste')) return { type: 'paste' };
  if (lowerCommand.includes('delete')) return { type: 'delete' };

  return null;
}

// Generate response for executed commands
function generateCommandResponse(action) {
  switch (action.type) {
    case 'open_app':
      return `Opening ${action.target}...`;
    case 'type_text':
      return `Typing: "${action.text}"`;
    case 'search':
      return `Searching for: ${action.query}`;
    case 'media_control':
      return `${action.action.charAt(0).toUpperCase() + action.action.slice(1)} media`;
    case 'system_action': {
      const label = action.action.replace('_', ' ');
      return label.charAt(0).toUpperCase() + label.slice(1);
    }
    case 'navigate': {
      const label = action.action.replace('_', ' ');
      return `Navigating ${label}`;
    }
    case 'screenshot':
      return 'Taking screenshot...';
    case 'copy':
      return 'Text copied to clipboard';
    case 'paste':
      return 'Text pasted from clipboard';
    case 'delete':
      return 'Item deleted';
    default:
      return 'Command executed';
  }
}

// Generate mock responses for unrecognized commands
function generateMockResponse(text) {
  const lowerText = text.toLowerCase();

  if (lowerText.includes('hello') || lowerText.includes('hi')) {
    return "Hello! I'm your AI voice assistant. How can I help you today?";
  }

  if (lowerText.includes('help')) {
    return "I can help you with voice commands! Try saying 'open chrome', 'type hello', 'search weather', 'play music', 'take screenshot', or 'go home'.";
  }

  if (lowerText.includes('how are you')) {
    return "I'm doing great! Ready to help you with voice commands.";
  }

  if (lowerText.includes('what can you do')) {
    return "I can open apps, type text, search the web, control media, adjust settings, take screenshots, and navigate your device using voice commands.";
  }

  return `I understand you said: "${text}". I can help with voice commands - just say 'help' to see what I can do!`;
}
