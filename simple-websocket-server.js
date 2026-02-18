// Simple WebSocket server for testing voice commands
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

console.log('🚀 WebSocket server started on ws://localhost:8080');

wss.on('connection', (ws) => {
  console.log('Client connected');
  
  // Send session created
  ws.send(JSON.stringify({
    type: 'session.created',
    session: {
      id: 'session_' + Date.now(),
      object: 'realtime.session'
    }
  }));

  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data);
      console.log('Received:', message.type);

      switch (message.type) {
        case 'conversation.item.create':
          if (message.item.type === 'message' && message.item.role === 'user') {
            // Extract user text
            const userText = message.item.content[0]?.text || '';
            console.log('User said:', userText);
            
            // Generate AI response
            const response = generateAIResponse(userText);
            
            // Send response
            ws.send(JSON.stringify({
              type: 'response.create',
              response: {
                id: 'response_' + Date.now(),
                object: 'realtime.response',
                status: 'completed'
              }
            }));

            // Send the actual response content
            setTimeout(() => {
              ws.send(JSON.stringify({
                type: 'response.audio_transcript.done',
                transcript: response
              }));
            }, 500);
          }
          break;

        case 'response.create':
          // Already handled above
          break;

        default:
          console.log('Unhandled message type:', message.type);
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

function generateAIResponse(userText) {
  const lowerText = userText.toLowerCase();
  
  // Voice command responses
  if (lowerText.includes('hello') || lowerText.includes('hi')) {
    return "Hello! I'm your AI voice assistant. I can help you with voice commands like opening apps, typing text, searching the web, and controlling your device. Try saying 'help' to see all available commands!";
  }
  
  if (lowerText.includes('help')) {
    return "Here are the voice commands I can help you with:\n\n📱 **App Control:** 'open chrome', 'launch camera', 'start messages'\n⌨️ **Text Input:** 'type hello world', 'write meeting notes'\n🔍 **Search:** 'search weather', 'google restaurants'\n🎵 **Media:** 'play music', 'pause', 'next song'\n⚙️ **System:** 'brightness up', 'wifi on', 'bluetooth off'\n📸 **Actions:** 'screenshot', 'copy', 'paste', 'delete'\n🧭 **Navigation:** 'go home', 'go back', 'recent apps'\n❓ **Help:** 'help', 'what can I say'\n\nJust say any of these commands and I'll help you out!";
  }
  
  if (lowerText.includes('open') || lowerText.includes('launch')) {
    return "I can help you open apps! Which app would you like to open? For example: 'open chrome', 'launch camera', or 'start messages'.";
  }
  
  if (lowerText.includes('type') || lowerText.includes('write')) {
    return "I can type text for you! What would you like me to type? Just say 'type' followed by your text, like 'type hello world'.";
  }
  
  if (lowerText.includes('search') || lowerText.includes('google')) {
    return "I can search the web for you! What would you like to search for? Say 'search' followed by your query, like 'search weather' or 'google restaurants'.";
  }
  
  if (lowerText.includes('play') || lowerText.includes('music')) {
    return "I can control your music! Say 'play music' to start, 'pause' to stop, or 'next song' to skip to the next track.";
  }
  
  if (lowerText.includes('screenshot')) {
    return "I can take a screenshot for you! Just say 'take screenshot' and I'll capture your screen.";
  }
  
  if (lowerText.includes('brightness') || lowerText.includes('wifi') || lowerText.includes('bluetooth')) {
    return "I can control system settings! Try 'brightness up' or 'brightness down' for screen brightness, 'wifi on' or 'wifi off' for Wi-Fi, and 'bluetooth on' or 'bluetooth off' for Bluetooth.";
  }
  
  if (lowerText.includes('how are you')) {
    return "I'm doing great, thanks for asking! I'm ready to help you with voice commands and make your life easier. What would you like to do today?";
  }
  
  if (lowerText.includes('what can you do')) {
    return "I'm your AI voice assistant! I can help you control your device using voice commands. I can open apps, type text, search the web, control media, adjust settings, take screenshots, and much more. Say 'help' to see all available commands!";
  }
  
  // Default conversational response
  return `I understand you said: "${userText}". I'm here to help you with voice commands! You can ask me to open apps, type text, search the web, control music, adjust settings, and more. Just say 'help' to see all available commands, or try something like 'open chrome' to get started!`;
}

console.log('WebSocket server is ready to handle voice commands!');
