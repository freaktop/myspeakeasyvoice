// Firebase voice service for real-time communication
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/integrations/firebase/client';
import { auth } from '@/integrations/firebase/client';

export interface ChatHistoryMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface FirebaseVoiceMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  audioTranscript?: string;
}

export interface FirebaseVoiceOptions {
  onMessage: (message: FirebaseVoiceMessage) => void;
  onConnectionChange: (connected: boolean) => void;
  onSpeakingChange: (speaking: boolean) => void;
  onError: (error: string) => void;
}

export class FirebaseVoiceService {
  private options: FirebaseVoiceOptions;
  private isConnected = false;
  private isSpeaking = false;
  private currentMessageId = '';

  constructor(options: FirebaseVoiceOptions) {
    this.options = options;
  }

  async connect() {
    try {
      console.log('Connecting to Firebase voice service...');
      
      // Test connection with a simple callable function
      const testConnection = httpsCallable(functions, 'testConnection');
      const result = await testConnection({ message: 'test' });
      
      if (result.data) {
        this.isConnected = true;
        this.options.onConnectionChange(true);
        
        // Send welcome message
        const welcomeMessage: FirebaseVoiceMessage = {
          id: 'firebase_welcome',
          type: 'system',
          content: 'Connected to Firebase! Voice commands are ready.',
          timestamp: new Date()
        };
        this.options.onMessage(welcomeMessage);
        
        console.log('Firebase voice service connected successfully');
      }
    } catch (error) {
      console.error('Firebase connection error:', error);
      this.isConnected = false;
      this.options.onConnectionChange(false);
      this.options.onError('Failed to connect to Firebase voice service');
    }
  }

  async sendTextMessage(text: string, history?: ChatHistoryMessage[]) {
    if (!this.isConnected) {
      throw new Error('Not connected to Firebase');
    }

    try {
      console.log('Sending text message via Firebase:', text);

      // Add user message
      const userMessage: FirebaseVoiceMessage = {
        id: `user_${Date.now()}`,
        type: 'user',
        content: text,
        timestamp: new Date()
      };
      this.options.onMessage(userMessage);

      // Call Firebase function for AI response
      const aiChat = httpsCallable(functions, 'aiChat');
      const result = await aiChat({
        message: text,
        userId: auth.currentUser?.uid ?? null,
        history: Array.isArray(history) ? history : undefined,
      });

      if (result.data) {
        const response = result.data as { response?: unknown };
        const responseText =
          typeof response.response === 'string'
            ? response.response
            : response.response != null
              ? JSON.stringify(response.response)
              : '';
        
        // Add assistant message
        const assistantMessage: FirebaseVoiceMessage = {
          id: `assistant_${Date.now()}`,
          type: 'assistant',
          content: responseText,
          timestamp: new Date()
        };
        this.options.onMessage(assistantMessage);
      }
    } catch (error) {
      console.error('Error sending message via Firebase:', error);
      this.options.onError('Failed to send message via Firebase');
    }
  }

  async sendVoiceCommand(command: string) {
    if (!this.isConnected) {
      throw new Error('Not connected to Firebase');
    }

    try {
      console.log('Sending voice command via Firebase:', command);

      // Call Firebase function for voice command processing
      const executeVoiceCommand = httpsCallable(functions, 'executeVoiceCommand');
      const result = await executeVoiceCommand({ 
        command: command,
        userId: 'web_user' // You can get this from Firebase Auth
      });

      if (result.data) {
        const response = result.data as { 
          response: string;
          executed: boolean;
          action?: string;
        };
        
        // Add system message for command execution
        const systemMessage: FirebaseVoiceMessage = {
          id: `system_${Date.now()}`,
          type: 'system',
          content: response.executed 
            ? `Command executed: ${response.action || command}`
            : `Command failed: ${response.response}`,
          timestamp: new Date()
        };
        this.options.onMessage(systemMessage);

        // Add assistant response
        const assistantMessage: FirebaseVoiceMessage = {
          id: `assistant_${Date.now()}`,
          type: 'assistant',
          content: response.response,
          timestamp: new Date()
        };
        this.options.onMessage(assistantMessage);
      }
    } catch (error) {
      console.error('Error executing voice command via Firebase:', error);
      this.options.onError('Failed to execute voice command via Firebase');
    }
  }

  disconnect() {
    console.log('Disconnecting from Firebase voice service...');
    this.isConnected = false;
    this.options.onConnectionChange(false);
  }

  get connected(): boolean {
    return this.isConnected;
  }

  get speaking(): boolean {
    return this.isSpeaking;
  }
}
