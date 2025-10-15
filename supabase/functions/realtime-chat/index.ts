import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  console.log("Setting up WebSocket connection to OpenAI Realtime API");

  const { socket, response } = Deno.upgradeWebSocket(req);
  
  // Connect to OpenAI Realtime API
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAIApiKey) {
    console.error("OpenAI API key not found");
    return new Response("Server configuration error", { status: 500 });
  }

  const openAIUrl = `wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01`;
  console.log("Connecting to OpenAI at:", openAIUrl);
  
  let openAISocket: WebSocket | null = null;
  let sessionConfigured = false;

  socket.onopen = () => {
    console.log("Client WebSocket connection established");
    
    // Connect to OpenAI
    openAISocket = new WebSocket(openAIUrl, undefined, {
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'OpenAI-Beta': 'realtime=v1'
      }
    });

    openAISocket.onopen = () => {
      console.log("Connected to OpenAI Realtime API");
    };

    openAISocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("OpenAI message type:", data.type);

      // Configure session after receiving session.created
      if (data.type === 'session.created' && !sessionConfigured) {
        console.log("Configuring session...");
        const sessionConfig = {
          type: "session.update",
          session: {
            modalities: ["text", "audio"],
            instructions: `You are a helpful voice assistant named SpeakEasy. You can help users with various tasks including:
- Setting reminders and managing schedules
- Answering questions and providing information  
- Controlling smart home devices
- Opening apps and managing system functions
- General conversation and assistance

Be natural, friendly, and conversational. Keep responses concise but helpful. When users ask you to perform actions, acknowledge what you're doing.`,
            voice: "alloy",
            input_audio_format: "pcm16",
            output_audio_format: "pcm16",
            input_audio_transcription: {
              model: "whisper-1"
            },
            turn_detection: {
              type: "server_vad",
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 1000
            },
            tools: [
              {
                type: "function",
                name: "open_app",
                description: "Open an application or navigate to a page in the voice assistant app",
                parameters: {
                  type: "object",
                  properties: {
                    app_name: { 
                      type: "string",
                      description: "The name of the app or page to open (settings, home, routines, commands)"
                    }
                  },
                  required: ["app_name"]
                }
              },
              {
                type: "function", 
                name: "set_reminder",
                description: "Set a reminder for the user",
                parameters: {
                  type: "object",
                  properties: {
                    message: { type: "string", description: "The reminder message" },
                    time: { type: "string", description: "When to remind (e.g., '5 minutes', 'tomorrow at 9am')" }
                  },
                  required: ["message", "time"]
                }
              },
              {
                type: "function",
                name: "system_action", 
                description: "Perform system actions like scrolling, going back, adjusting volume",
                parameters: {
                  type: "object",
                  properties: {
                    action: { 
                      type: "string",
                      description: "The action to perform (scroll_up, scroll_down, go_back, go_home, volume_up, volume_down)"
                    }
                  },
                  required: ["action"]
                }
              }
            ],
            tool_choice: "auto",
            temperature: 0.8,
            max_response_output_tokens: "inf"
          }
        };
        
        openAISocket?.send(JSON.stringify(sessionConfig));
        sessionConfigured = true;
      }

      // Forward all messages to client
      socket.send(event.data);
    };

    openAISocket.onerror = (error) => {
      console.error("OpenAI WebSocket error:", error);
      socket.send(JSON.stringify({
        type: 'error',
        error: 'OpenAI connection error'
      }));
    };

    openAISocket.onclose = (event) => {
      console.log("OpenAI WebSocket closed:", event.code, event.reason);
      socket.close();
    };
  };

  socket.onmessage = (event) => {
    // Forward client messages to OpenAI
    if (openAISocket && openAISocket.readyState === WebSocket.OPEN) {
      const data = JSON.parse(event.data);
      console.log("Client message type:", data.type);
      
      // Handle function call responses
      if (data.type === 'conversation.item.create' && data.item?.type === 'function_call_output') {
        console.log("Function call response:", data.item.output);
      }
      
      openAISocket.send(event.data);
    }
  };

  socket.onerror = (error) => {
    console.error("Client WebSocket error:", error);
  };

  socket.onclose = () => {
    console.log("Client WebSocket closed");
    openAISocket?.close();
  };

  return response;
});