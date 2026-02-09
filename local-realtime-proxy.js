// Temporary local proxy server to test OpenAI connection
// Run with: node local-realtime-proxy.js
import 'dotenv/config';
import http from 'http';
import { WebSocketServer } from 'ws';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY not set in .env');
  process.exit(1);
}
const PORT = 3001;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('WebSocket server running');
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws, req) => {
  console.log('Client connected');

  // Connect to OpenAI Realtime API
  const openaiWs = new WebSocket('wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01', {
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'OpenAI-Beta': 'realtime=v1'
    }
  });

  openaiWs.on('open', () => {
    console.log('Connected to OpenAI');
    // Send session configuration
    openaiWs.send(JSON.stringify({
      type: 'session.update',
      session: {
        modalities: ['text', 'audio'],
        instructions: 'You are a helpful voice assistant.',
        voice: 'alloy',
        input_audio_format: 'pcm16',
        output_audio_format: 'pcm16',
        turn_detection: {
          type: 'server_vad',
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: 500
        }
      }
    }));
  });

  // Proxy messages from client to OpenAI
  ws.on('message', (data) => {
    if (openaiWs.readyState === WebSocket.OPEN) {
      openaiWs.send(data);
    }
  });

  // Proxy messages from OpenAI to client
  openaiWs.on('message', (data) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(data);
    }
  });

  openaiWs.on('error', (error) => {
    console.error('OpenAI WebSocket error:', error);
    ws.close();
  });

  openaiWs.on('close', () => {
    console.log('OpenAI connection closed');
    ws.close();
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    openaiWs.close();
  });
});

server.listen(PORT, () => {
  console.log(`Local proxy server running on port ${PORT}`);
  console.log(`Connect to: ws://localhost:${PORT}`);
});
