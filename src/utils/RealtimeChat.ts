// OpenAI Realtime API WebSocket client
import { AudioRecorder, encodeAudioForAPI, playAudioData, clearAudioQueue } from './RealtimeAudio';
import { supabase } from '@/integrations/supabase/client';

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
  private mockMode = false;

  constructor(private options: RealtimeChatOptions) {}

  async connect(): Promise<void> {
    try {
      console.log("Connecting to Realtime Chat...");
      
      // Initialize audio context
      this.audioContext = new AudioContext({ sampleRate: 24000 });
      
      // Get WebSocket URL from environment
      const wsUrl = import.meta.env.VITE_WEBSOCKET_URL;
      
      if (!wsUrl) {
        console.warn("WebSocket URL not configured, running in mock mode");
        this.mockMode = true;
        this.options.onError("WebSocket not configured - running in mock mode");
        this.startMockMode();
        return;
      }

      console.log("Connecting to WebSocket:", wsUrl);
      
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log("WebSocket connected");
        this.isConnected = true;
        this.options.onConnectionChange(true);
        this.startRecording();
      };

      this.ws.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        console.log("Received message type:", data.type);
        await this.handleMessage(data);
      };

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        console.log("Falling back to mock mode due to connection failure");
        this.mockMode = true;
        this.options.onError("WebSocket connection failed - running in mock mode");
        this.startMockMode();
      };

      this.ws.onclose = (event) => {
        console.log("WebSocket closed:", event.code, event.reason);
        this.isConnected = false;
        this.options.onConnectionChange(false);
        
        // Fall back to mock mode if connection fails
        if (event.code !== 1000 && !this.mockMode) {
          console.log("Connection lost unexpectedly, switching to mock mode");
          this.mockMode = true;
          this.startMockMode();
        } else {
          this.cleanup();
        }
      };

    } catch (error) {
      console.error("Error connecting:", error);
      this.mockMode = true;
      this.options.onError(error instanceof Error ? error.message : "Connection failed - running in mock mode");
      this.startMockMode();
    }
  }

  private startMockMode() {
    console.log("🤖 Starting mock mode for voice commands");
    this.options.onConnectionChange(false);
    
    // Simulate a mock connection for testing voice commands
    setTimeout(() => {
      const mockMessage: RealtimeMessage = {
        id: 'mock_welcome',
        type: 'system',
        content: 'Mock mode active - Voice commands are ready for testing',
        timestamp: new Date()
      };
      this.options.onMessage(mockMessage);
    }, 1000);
  }

  private async handleMessage(data: any) {
    switch (data.type) {
      case 'session.created':
        console.log("Session created");
        break;

      case 'session.updated':
        console.log("Session updated");
        break;

      case 'response.created':
        console.log("Response created");
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
        console.log("Audio response complete");
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
        console.log("Function call:", data.name, data.arguments);
        await this.handleFunctionCall(data.name, JSON.parse(data.arguments || '{}'));
        break;

      case 'input_audio_buffer.speech_started':
        console.log("User started speaking");
        // Clear any ongoing AI audio
        clearAudioQueue();
        if (this.isSpeaking) {
          this.isSpeaking = false;
          this.options.onSpeakingChange(false);
        }
        break;

      case 'input_audio_buffer.speech_stopped':
        console.log("User stopped speaking");
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
        console.log("Unhandled message type:", data.type);
    }
  }

  private async handleFunctionCall(name: string, args: any) {
    console.log(`Executing function: ${name}`, args);
    
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
      console.log("Starting audio recording...");
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
      console.log("Audio recording started");
    } catch (error) {
      console.error("Error starting recording:", error);
      this.options.onError("Could not access microphone");
    }
  }

  async sendTextMessage(text: string) {
    if (this.mockMode) {
      // Handle text in mock mode
      console.log("Mock mode - processing text:", text);
      
      // Simulate user message
      const userMessage: RealtimeMessage = {
        id: `user_${Date.now()}`,
        type: 'user',
        content: text,
        timestamp: new Date()
      };
      this.options.onMessage(userMessage);
      
      // Simulate AI response
      setTimeout(() => {
        const response = this.generateMockResponse(text);
        const assistantMessage: RealtimeMessage = {
          id: `assistant_${Date.now()}`,
          type: 'assistant',
          content: response,
          timestamp: new Date()
        };
        this.options.onMessage(assistantMessage);
      }, 1000);
      
      return;
    }
    
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('Not connected');
    }

    console.log("Sending text message:", text);

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
    console.log("Disconnecting...");
    this.cleanup();
    this.ws?.close();
  }

  private generateMockResponse(text: string): string {
    const lowerText = text.toLowerCase();
    
    // Greetings
    if (lowerText.includes('hello') || lowerText.includes('hi') || lowerText.includes('hey')) {
      return "Hello! I'm your AI voice assistant. I'm here to help you with voice commands and make your life easier. You can ask me to open apps, type text, search the web, control music, adjust settings, and much more. What would you like to do today?";
    }
    
    // How are you
    if (lowerText.includes('how are you')) {
      return "I'm doing great, thanks for asking! I'm excited to help you with voice commands. I can assist you with all sorts of tasks - just say 'help' to see everything I can do, or tell me what you need help with!";
    }
    
    // What can you do
    if (lowerText.includes('what can you do') || lowerText.includes('what do you do')) {
      return "I'm your AI voice assistant with lots of capabilities! Here's what I can help you with:\n\n📱 **App Control**: Open any app like 'open chrome' or 'launch camera'\n⌨️ **Text Input**: Type text for you with 'type hello world'\n🔍 **Search**: Find information with 'search weather' or 'google restaurants'\n🎵 **Media Control**: Play/pause music, skip tracks\n⚙️ **System Settings**: Adjust brightness, Wi-Fi, Bluetooth\n📸 **Actions**: Take screenshots, copy/paste text\n🧭 **Navigation**: Go to home, back, or recent apps\n\nJust say any command and I'll help you out!";
    }
    
    // Help
    if (lowerText.includes('help')) {
      return "I'd be happy to help! Here are all the voice commands I can handle:\n\n**🎯 Getting Started:**\n• 'hello' - Chat with me\n• 'help' - See this menu\n• 'what can you do' - Learn my capabilities\n\n**📱 Apps:**\n• 'open chrome' - Launch Chrome\n• 'launch camera' - Open camera\n• 'start messages' - Open messaging app\n\n**⌨️ Text:**\n• 'type hello world' - Type text\n• 'write meeting notes' - Dictate notes\n\n**🔍 Search:**\n• 'search weather' - Web search\n• 'google restaurants' - Google search\n\n**🎵 Media:**\n• 'play music' - Start music\n• 'pause' - Pause playback\n• 'next song' - Skip track\n\n**⚙️ Settings:**\n• 'brightness up/down' - Screen brightness\n• 'wifi on/off' - Wi-Fi control\n• 'bluetooth on/off' - Bluetooth control\n\n**📸 Actions:**\n• 'take screenshot' - Capture screen\n• 'copy' - Copy text\n• 'paste' - Paste text\n• 'delete' - Delete text\n\n**🧭 Navigation:**\n• 'go home' - Home screen\n• 'go back' - Go back\n• 'recent apps' - App switcher\n\nWhat would you like to try first?";
    }
    
    // App commands
    if (lowerText.includes('open') || lowerText.includes('launch') || lowerText.includes('start')) {
      if (lowerText.includes('chrome')) return "Opening Chrome browser for you!";
      if (lowerText.includes('camera')) return "Launching your camera app!";
      if (lowerText.includes('message')) return "Opening your messaging app!";
      return "I can open apps for you! Which app would you like? You can say 'open chrome', 'launch camera', or 'start messages'.";
    }
    
    // Type commands
    if (lowerText.includes('type') || lowerText.includes('write') || lowerText.includes('dictate')) {
      if (lowerText.match(/type\s+(.+)/) || lowerText.match(/write\s+(.+)/)) {
        const match = text.match(/(?:type|write)\s+(.+)/i);
        return `I'll type "${match[1]}" for you! This is great for quick text input.`;
      }
      return "I can type text for you! Just say 'type' followed by what you want to type, like 'type hello world'.";
    }
    
    // Search commands
    if (lowerText.includes('search') || lowerText.includes('google') || lowerText.includes('look up')) {
      if (lowerText.match(/search\s+(.+)/) || lowerText.match(/google\s+(.+)/)) {
        const match = text.match(/(?:search|google)\s+(.+)/i);
        return `I'll search for "${match[1]}" for you. Let me find that information!`;
      }
      return "I can search the web for you! Say 'search' followed by what you're looking for, like 'search weather' or 'google restaurants'.";
    }
    
    // Media commands
    if (lowerText.includes('play') || lowerText.includes('music') || lowerText.includes('pause') || lowerText.includes('next') || lowerText.includes('previous')) {
      if (lowerText.includes('play')) return "Starting music playback for you! 🎵";
      if (lowerText.includes('pause')) return "Pausing the music.";
      if (lowerText.includes('next') || lowerText.includes('skip')) return "Skipping to the next track.";
      if (lowerText.includes('previous')) return "Going back to the previous track.";
      return "I can control your media! Try 'play music', 'pause', 'next song', or 'previous track'.";
    }
    
    // System commands
    if (lowerText.includes('brightness') || lowerText.includes('wifi') || lowerText.includes('bluetooth') || lowerText.includes('volume')) {
      if (lowerText.includes('brightness up')) return "Increasing screen brightness for you! ☀️";
      if (lowerText.includes('brightness down')) return "Decreasing screen brightness. 🌙";
      if (lowerText.includes('wifi on')) return "Turning Wi-Fi on! 📶";
      if (lowerText.includes('wifi off')) return "Turning Wi-Fi off.";
      if (lowerText.includes('bluetooth on')) return "Enabling Bluetooth! 📡";
      if (lowerText.includes('bluetooth off')) return "Disabling Bluetooth.";
      if (lowerText.includes('volume up')) return "Increasing volume volume! 🔊";
      if (lowerText.includes('volume down')) return "Decreasing volume. 🔉";
      return "I can control system settings! Try 'brightness up/down', 'wifi on/off', 'bluetooth on/off', or 'volume up/down'.";
    }
    
    // Action commands
    if (lowerText.includes('screenshot') || lowerText.includes('copy') || lowerText.includes('paste') || lowerText.includes('delete')) {
      if (lowerText.includes('screenshot')) return "Taking a screenshot for you! 📸";
      if (lowerText.includes('copy')) return "Copying selected text to clipboard. 📋";
      if (lowerText.includes('paste')) return "Pasting from clipboard.";
      if (lowerText.includes('delete')) return "Deleting selected text or item.";
      return "I can perform actions! Try 'screenshot', 'copy', 'paste', or 'delete'.";
    }
    
    // Navigation commands
    if (lowerText.includes('home') || lowerText.includes('back') || lowerText.includes('recent')) {
      if (lowerText.includes('home')) return "Going to home screen! 🏠";
      if (lowerText.includes('back')) return "Going back to the previous screen.";
      if (lowerText.includes('recent')) return "Opening recent apps switcher.";
      return "I can help you navigate! Try 'go home', 'go back', or 'recent apps'.";
    }
    
    // Conversational responses
    if (lowerText.includes('thank')) {
      return "You're welcome! I'm here to help with any voice commands you need. What else can I assist you with?";
    }
    
    if (lowerText.includes('goodbye') || lowerText.includes('bye') || lowerText.includes('see you')) {
      return "Goodbye! I'll be here whenever you need voice command assistance. Have a great day! 👋";
    }
    
    if (lowerText.includes('awesome') || lowerText.includes('cool') || lowerText.includes('great')) {
      return "Thank you! I'm excited to help you with voice commands. Is there anything specific you'd like to try?";
    }
    
    // Default response - more conversational
    return `I understand you said: "${text}". I'm your AI voice assistant and I'm here to help! You can ask me to open apps, type text, search the web, control media, adjust settings, take screenshots, and much more. Just say 'help' to see all available commands, or try something like 'open chrome' to get started. How can I help you today?`;
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