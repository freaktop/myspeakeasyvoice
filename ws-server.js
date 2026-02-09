const WebSocket = require('ws');

console.log('🚀 Starting WebSocket server on port 8080...');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', function connection(ws) {
  console.log('✅ Client connected');
  
  // Send initial session message
  ws.send(JSON.stringify({
    type: 'session.created',
    session: {
      id: 'session_' + Date.now(),
      object: 'realtime.session'
    }
  }));

  ws.on('message', function incoming(data) {
    try {
      const message = JSON.parse(data);
      console.log('📨 Received:', message.type);

      if (message.type === 'conversation.item.create' && 
          message.item && 
          message.item.type === 'message' && 
          message.item.role === 'user') {
        
        const userText = message.item.content[0] ? message.item.content[0].text : '';
        console.log('🗣️ User said:', userText);
        
        // Generate AI response
        const response = generateAIResponse(userText);
        
        // Send response
        ws.send(JSON.stringify({
          type: 'response.audio_transcript.done',
          transcript: response
        }));
      }
    } catch (error) {
      console.error('❌ Error processing message:', error.message);
    }
  });

  ws.on('close', function close() {
    console.log('❌ Client disconnected');
  });

  ws.on('error', function error(err) {
    console.error('❌ WebSocket error:', err.message);
  });
});

function generateAIResponse(userText) {
  const lowerText = userText.toLowerCase();
  
  if (lowerText.includes('hello') || lowerText.includes('hi')) {
    return "Hello! I'm your AI voice assistant. I can help you with voice commands like opening apps, typing text, searching the web, and controlling your device. Try saying 'help' to see all available commands!";
  }
  
  if (lowerText.includes('help')) {
    return "Here are the voice commands I can help you with:\n\n📱 App Control: 'open chrome', 'launch camera'\n⌨️ Text Input: 'type hello world'\n🔍 Search: 'search weather'\n🎵 Media: 'play music', 'pause'\n⚙️ System: 'brightness up', 'wifi on'\n📸 Actions: 'screenshot', 'copy', 'paste'\n🧭 Navigation: 'go home', 'go back'\n❓ Help: 'help'\n\nWhat would you like to do?";
  }
  
  if (lowerText.includes('how are you')) {
    return "I'm doing great, thanks for asking! I'm ready to help you with voice commands. What can I help you with today?";
  }
  
  if (lowerText.includes('what can you do')) {
    return "I'm your AI voice assistant! I can open apps, type text, search the web, control media, adjust settings, take screenshots, and much more. Just say 'help' to see all commands!";
  }
  
  if (lowerText.includes('open')) {
    return "I can open apps for you! Which app would you like to open? Try 'open chrome', 'launch camera', or 'start messages'.";
  }
  
  if (lowerText.includes('type') || lowerText.includes('write')) {
    return "I can type text for you! What would you like me to type? Say 'type' followed by your text.";
  }
  
  if (lowerText.includes('search')) {
    return "I can search the web! What would you like to search for? Say 'search' followed by your query.";
  }
  
  if (lowerText.includes('play') || lowerText.includes('music')) {
    return "I can control your music! Say 'play music' to start, 'pause' to stop, or 'next song' to skip.";
  }
  
  if (lowerText.includes('brightness') || lowerText.includes('wifi') || lowerText.includes('bluetooth')) {
    return "I can control system settings! Try 'brightness up' or 'brightness down' for screen brightness, 'wifi on' or 'wifi off' for Wi-Fi, and 'bluetooth on' or 'bluetooth off' for Bluetooth.";
  }
  
  if (lowerText.includes('screenshot')) {
    return "I can take a screenshot for you! Just say 'take screenshot' and I'll capture your screen.";
  }
  
  // Default conversational response
  return `I heard you say: "${userText}". I'm here to help with voice commands! Say 'help' to see what I can do, or try commands like 'open chrome' or 'type hello'. How can I assist you today?`;
}

console.log('🎤 WebSocket server ready! Connect your app to ws://localhost:8080');
