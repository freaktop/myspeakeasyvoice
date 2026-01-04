// OpenAI Realtime API WebSocket client
import { AudioRecorder, encodeAudioForAPI, playAudioData, clearAudioQueue } from './RealtimeAudio';
import { supabase } from '@/integrations/supabase/client';
import { logger } from './logger';

export interface RealtimeMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  audioTranscript?: string;
}

export interface RealtimeChatOptions {
  onMessage: (message: RealtimeMessage) => void;
  onSpeakingChange: (speaking: boolean) => void;
  onConnectionChange: (connected: boolean) => void;
  onError: (error: string) => void;
}

export class RealtimeChat {
  private ws: WebSocket | null = null;
  private audioContext: AudioContext | null = null;
  private recorder: AudioRecorder | null = null;
  private isConnected = false;
  private isSpeaking = false;
  private currentTranscript = '';
  private currentMessageId = '';

  constructor(private options: RealtimeChatOptions) {}

  async connect(): Promise<void> {
    try {
      logger.log("Connecting to Realtime Chat...");
      
      // Initialize audio context
      this.audioContext = new AudioContext({ sampleRate: 24000 });
      
      // Connect to WebSocket - use VITE_WEBSOCKET_URL if set, otherwise fallback to Supabase function
      const websocketUrl = import.meta.env.VITE_WEBSOCKET_URL;
      let wsUrl: string;
      
      if (!websocketUrl) {
        logger.warn('VITE_WEBSOCKET_URL not set. Using fallback Supabase function URL.');
        // Fallback to Supabase function if no env var is set
        wsUrl = `wss://zofxbilhjehbtlbtence.functions.supabase.co/functions/v1/realtime-chat`;
        logger.log("Connecting to WebSocket (fallback):", wsUrl);
      } else {
        // Ensure we're not using functions/v1 URLs
        if (websocketUrl.includes('/functions/v1/')) {
          console.error('VITE_WEBSOCKET_URL should not use functions/v1. Please use a direct WebSocket URL.');
          throw new Error('Invalid WebSocket URL format');
        }
        
        // Get auth token if available
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        
        wsUrl = websocketUrl;
        if (token) {
          const separator = wsUrl.includes('?') ? '&' : '?';
          wsUrl = `${wsUrl}${separator}token=${encodeURIComponent(token)}`;
        }
        
        logger.log("Connecting to WebSocket:", wsUrl);
      }
      
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        logger.log("WebSocket connected");
        this.isConnected = true;
        this.options.onConnectionChange(true);
        this.startRecording();
      };

      this.ws.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        logger.log("Received message type:", data.type);
        await this.handleMessage(data);
      };

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        this.options.onError("Connection error occurred");
      };

      this.ws.onclose = (event) => {
        logger.log("WebSocket closed:", event.code, event.reason);
        this.isConnected = false;
        this.options.onConnectionChange(false);
        this.cleanup();
      };

    } catch (error) {
      console.error("Error connecting:", error);
      this.options.onError(error instanceof Error ? error.message : "Connection failed");
    }
  }

  private async handleMessage(data: any) {
    switch (data.type) {
      case 'session.created':
        logger.log("Session created");
        break;

      case 'session.updated':
        logger.log("Session updated");
        break;

      case 'response.created':
        logger.log("Response created");
        this.currentMessageId = data.response?.id || `msg_${Date.now()}`;
        this.currentTranscript = '';
        break;

      case 'response.audio.delta':
        // Play audio chunk
        if (data.delta && this.audioContext) {
          try {
            const binaryString = atob(data.delta);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            await playAudioData(this.audioContext, bytes);
            
            if (!this.isSpeaking) {
              this.isSpeaking = true;
              this.options.onSpeakingChange(true);
            }
          } catch (error) {
            console.error("Error playing audio:", error);
          }
        }
        break;

      case 'response.audio_transcript.delta':
        // Accumulate transcript
        if (data.delta) {
          this.currentTranscript += data.delta;
        }
        break;

      case 'response.audio.done':
        logger.log("Audio response complete");
        this.isSpeaking = false;
        this.options.onSpeakingChange(false);
        break;

      case 'response.audio_transcript.done':
        // Send complete transcript as message
        if (this.currentTranscript.trim()) {
          const message: RealtimeMessage = {
            id: this.currentMessageId,
            type: 'assistant',
            content: this.currentTranscript.trim(),
            timestamp: new Date(),
            audioTranscript: this.currentTranscript.trim()
          };
          this.options.onMessage(message);
          this.currentTranscript = '';
        }
        break;

      case 'response.function_call_arguments.done':
        // Handle function calls
        logger.log("Function call:", data.name, data.arguments);
        await this.handleFunctionCall(data.name, JSON.parse(data.arguments || '{}'));
        break;

      case 'input_audio_buffer.speech_started':
        logger.log("User started speaking");
        // Clear any ongoing AI audio
        clearAudioQueue();
        if (this.isSpeaking) {
          this.isSpeaking = false;
          this.options.onSpeakingChange(false);
        }
        break;

      case 'input_audio_buffer.speech_stopped':
        logger.log("User stopped speaking");
        break;

      case 'conversation.item.input_audio_transcription.completed':
        // User speech transcript
        if (data.transcript) {
          const message: RealtimeMessage = {
            id: `user_${Date.now()}`,
            type: 'user',
            content: data.transcript,
            timestamp: new Date()
          };
          this.options.onMessage(message);
        }
        break;

      case 'error':
        console.error("OpenAI error:", data.error);
        this.options.onError(data.error?.message || "An error occurred");
        break;

      default:
        logger.log("Unhandled message type:", data.type);
    }
  }

  private async handleFunctionCall(name: string, args: any) {
    logger.log(`Executing function: ${name}`, args);
    
    let result = "Function executed successfully";
    
    try {
      switch (name) {
        case 'open_app':
          if (args.app_name) {
            const appMap: Record<string, string> = {
              'settings': '/settings',
              'home': '/',
              'routines': '/routines',
              'commands': '/commands',
              'command log': '/commands'
            };
            const path = appMap[args.app_name.toLowerCase()] || '/';
            window.location.href = path;
            result = `Opened ${args.app_name}`;
          }
          break;

        case 'set_reminder':
          result = `Reminder set: "${args.message}" for ${args.time}`;
          // In a real app, you'd integrate with a calendar/reminder system
          break;

        case 'system_action':
          switch (args.action) {
            case 'scroll_up':
              window.scrollBy(0, -300);
              result = "Scrolled up";
              break;
            case 'scroll_down':
              window.scrollBy(0, 300);
              result = "Scrolled down";
              break;
            case 'go_back':
              window.history.back();
              result = "Went back";
              break;
            case 'go_home':
              window.location.href = '/';
              result = "Went to home";
              break;
            default:
              result = `System action ${args.action} not supported on web`;
          }
          break;

        default:
          result = `Unknown function: ${name}`;
      }
    } catch (error) {
      result = `Error executing ${name}: ${error}`;
      console.error("Function execution error:", error);
    }

    // Send function result back to OpenAI
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'conversation.item.create',
        item: {
          type: 'function_call_output',
          call_id: args.call_id,
          output: result
        }
      }));
    }
  }

  private async startRecording() {
    try {
      logger.log("Starting audio recording...");
      this.recorder = new AudioRecorder((audioData) => {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          const encodedAudio = encodeAudioForAPI(audioData);
          this.ws.send(JSON.stringify({
            type: 'input_audio_buffer.append',
            audio: encodedAudio
          }));
        }
      });
      
      await this.recorder.start();
      logger.log("Audio recording started");
    } catch (error) {
      console.error("Error starting recording:", error);
      this.options.onError("Could not access microphone");
    }
  }

  async sendTextMessage(text: string) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('Not connected');
    }

    logger.log("Sending text message:", text);

    // Add user message to conversation
    const userMessage: RealtimeMessage = {
      id: `user_${Date.now()}`,
      type: 'user',
      content: text,
      timestamp: new Date()
    };
    this.options.onMessage(userMessage);

    // Send to OpenAI
    this.ws.send(JSON.stringify({
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [
          {
            type: 'input_text',
            text
          }
        ]
      }
    }));

    // Trigger response
    this.ws.send(JSON.stringify({
      type: 'response.create'
    }));
  }

  disconnect() {
    logger.log("Disconnecting...");
    this.cleanup();
    this.ws?.close();
  }

  private cleanup() {
    this.recorder?.stop();
    this.recorder = null;
    clearAudioQueue();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }

  get connected(): boolean {
    return this.isConnected;
  }

  get speaking(): boolean {
    return this.isSpeaking;
  }
}