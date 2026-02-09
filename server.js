// Simple WebSocket server
const http = require('http');
const { WebSocketServer } = require('ws');

const server = http.createServer();
const wss = new WebSocketServer({ server });

console.log('🚀 Starting WebSocket server...');

wss.on('connection', (ws) => {
  console.log('✅ Client connected');
  
  // Send welcome message
  ws.send(JSON.stringify({
    type: 'session.created',
    session: {
      id: 'session_' + Date.now(),
      object: 'realtime.session'
    }
  }));

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log('📨 Received:', message.type);

      if (message.type === 'conversation.item.create' && 
          message.item?.type === 'message' && 
          message.item?.role === 'user') {
        
        const userText = message.item.content[0]?.text || '';
        console.log('🗣️ User said:', userText);
        
        // Generate response
        const response = generateResponse(userText);
        
        // Send response
        ws.send(JSON.stringify({
          type: 'response.audio_transcript.done',
          transcript: response
        }));
      }
    } catch (error) {
      console.error('❌ Error:', error.message);
    }
  });

  ws.on('close', () => {
    console.log('❌ Client disconnected');
  });

  ws.on('error', (error) => {
    console.error('❌ WebSocket error:', error.message);
  });
});

function generateResponse(text) {
  const lower = text.toLowerCase();
  
  if (lower.includes('hello') || lower.includes('hi')) {
    return "Hello! I'm your AI voice assistant. I can help you with voice commands like opening apps, typing text, searching the web, and controlling your device. Try saying 'help' to see all available commands!";
  }
  
  if (lower.includes('help')) {
    return "Here are the voice commands I can help you with:\n\n📱 App Control: 'open chrome', 'launch camera'\n⌨️ Text Input: 'type hello world'\n🔍 Search: 'search weather'\n🎵 Media: 'play music', 'pause'\n⚙️ System: 'brightness up', 'wifi on'\n📸 Actions: 'screenshot', 'copy', 'paste'\n🧭 Navigation: 'go home', 'go back'\n❓ Help: 'help'\n\nWhat would you like to do?";
  }
  
  if (lower.includes('how are you')) {
    return "I'm doing great, thanks for asking! I'm ready to help you with voice commands. What can I help you with today?";
  }
  
  if (lower.includes('what can you do')) {
    return "I'm your AI voice assistant! I can open apps, type text, search the web, control media, adjust settings, take screenshots, and much more. Just say 'help' to see all commands!";
  }
  
  if (lower.includes('open')) {
    return "I can open apps for you! Which app would you like to open? Try 'open chrome', 'launch camera', or 'start messages'.";
  }
  
  if (lower.includes('type') || lower.includes('write')) {
    return "I can type text for you! What would you like me to type? Say 'type' followed by your text.";
  }
  
  if (lower.includes('search')) {
    return "I can search the web! What would you like to search for? Say 'search' followed by your query.";
  }
  
  if (lower.includes('play') || lower.includes('music')) {
    return "I can control your music! Say 'play music' to start, 'pause' to stop, or 'next song' to skip.";
  }
  
  return `I heard you say: "${text}". I'm here to help with voice commands! Say 'help' to see what I can do, or try commands like 'open chrome' or 'type hello'.`;
}

const PORT = 8080;
server.listen(PORT, () => {
  console.log(`🚀 WebSocket server running on ws://localhost:${PORT}`);
  console.log('🎤 Ready for voice commands!');
});
