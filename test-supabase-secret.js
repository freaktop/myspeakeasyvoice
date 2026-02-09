// Test if Supabase Edge Function has the OpenAI API key
async function testEdgeFunction() {
  const wsUrl = 'wss://zofxbilhjehbtlbtence.functions.supabase.co/functions/v1/realtime-chat';
  
  console.log('Connecting to:', wsUrl);
  
  const ws = new WebSocket(wsUrl);
  
  ws.onopen = () => {
    console.log('✅ WebSocket connected');
  };
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('📨 Message received:', data);
    
    if (data.type === 'error') {
      console.error('❌ Error from function:', data.error);
      if (data.error.message && data.error.message.includes('bearer')) {
        console.error('🔑 API KEY IS MISSING OR NOT LOADED BY EDGE FUNCTION');
      }
    }
  };
  
  ws.onerror = (error) => {
    console.error('❌ WebSocket error:', error);
  };
  
  ws.onclose = (event) => {
    console.log('Connection closed:', event.code, event.reason);
  };
  
  // Send a test message after 2 seconds
  setTimeout(() => {
    if (ws.readyState === WebSocket.OPEN) {
      console.log('Sending test message...');
      ws.send(JSON.stringify({ type: 'test' }));
    }
  }, 2000);
}

testEdgeFunction();
