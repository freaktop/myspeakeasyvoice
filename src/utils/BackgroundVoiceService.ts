import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';

export class BackgroundVoiceService {
  private static instance: BackgroundVoiceService;
  private isListening = false;
  private recognition: any = null;
  private onCommandCallback?: (command: string) => void;

  constructor() {
    this.initializeVoiceRecognition();
  }

  static getInstance(): BackgroundVoiceService {
    if (!BackgroundVoiceService.instance) {
      BackgroundVoiceService.instance = new BackgroundVoiceService();
    }
    return BackgroundVoiceService.instance;
  }

  private initializeVoiceRecognition() {
    if (Capacitor.isNativePlatform()) {
      // For native platforms, we'll use a native speech recognition plugin
      this.initializeNativeSpeechRecognition();
    } else {
      // For web, use Web Speech API
      this.initializeWebSpeechRecognition();
    }
  }

  private initializeNativeSpeechRecognition() {
    // This would require implementing a native plugin for continuous speech recognition
    // For now, we'll simulate it
    console.log('Native speech recognition initialized');
  }

  private initializeWebSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      this.recognition = new SpeechRecognition();
      
      this.recognition.continuous = true;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';
      
      this.recognition.onstart = () => {
        console.log('Voice recognition started');
        this.isListening = true;
      };
      
      this.recognition.onresult = (event: any) => {
        const lastResultIndex = event.results.length - 1;
        const transcript = event.results[lastResultIndex][0].transcript.trim();
        
        console.log('Voice command received:', transcript);
        
        // Check for wake phrase
        if (this.containsWakePhrase(transcript)) {
          const command = this.extractCommand(transcript);
          if (command && this.onCommandCallback) {
            this.onCommandCallback(command);
          }
        }
      };
      
      this.recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          console.error('Microphone access denied');
        }
        // Restart recognition after error
        setTimeout(() => {
          if (this.isListening) {
            this.startListening();
          }
        }, 1000);
      };
      
      this.recognition.onend = () => {
        console.log('Voice recognition ended');
        // Restart recognition for continuous listening
        if (this.isListening) {
          setTimeout(() => {
            this.recognition.start();
          }, 100);
        }
      };
    } else {
      console.warn('Speech recognition not supported in this browser');
    }
  }

  private containsWakePhrase(transcript: string): boolean {
    const wakePhrases = [
      'hey speakeasy',
      'hey speak easy',
      'speakeasy',
      'voice command',
      'assistant'
    ];
    
    const lowerTranscript = transcript.toLowerCase();
    return wakePhrases.some(phrase => lowerTranscript.includes(phrase));
  }

  private extractCommand(transcript: string): string | null {
    const lowerTranscript = transcript.toLowerCase();
    
    // Find wake phrase and extract command after it
    const wakePhrases = ['hey speakeasy', 'hey speak easy', 'speakeasy', 'voice command', 'assistant'];
    
    for (const phrase of wakePhrases) {
      const index = lowerTranscript.indexOf(phrase);
      if (index !== -1) {
        const command = transcript.substring(index + phrase.length).trim();
        return command || null;
      }
    }
    
    return null;
  }

  async startBackgroundListening(onCommand: (command: string) => void) {
    this.onCommandCallback = onCommand;
    
    if (Capacitor.isNativePlatform()) {
      // Request background permissions and start native service
      await this.requestBackgroundPermissions();
      await this.startNativeBackgroundService();
    } else {
      // For web, start continuous recognition
      this.startListening();
    }
  }

  private async requestBackgroundPermissions() {
    try {
      // Request microphone permission
      const permission = await navigator.mediaDevices.getUserMedia({ audio: true });
      permission.getTracks().forEach(track => track.stop());
      
      // For native apps, also request background execution permission
      if (Capacitor.isNativePlatform()) {
        // This would require implementing custom permission requests
        console.log('Requesting background permissions...');
      }
      
      return true;
    } catch (error) {
      console.error('Failed to request permissions:', error);
      return false;
    }
  }

  private async startNativeBackgroundService() {
    // This would start a native background service for speech recognition
    // The implementation would differ between Android and iOS
    console.log('Starting native background voice service...');
    
    // For Android: Start a foreground service with speech recognition
    // For iOS: Use background processing tasks (limited time)
    
    if (Capacitor.getPlatform() === 'android') {
      // Android implementation
      await this.startAndroidBackgroundService();
    } else if (Capacitor.getPlatform() === 'ios') {
      // iOS implementation
      await this.startIOSBackgroundProcessing();
    }
  }

  private async startAndroidBackgroundService() {
    // Android allows foreground services for speech recognition
    console.log('Starting Android foreground service for voice recognition...');
    
    // This would call a native Android plugin to:
    // 1. Start a foreground service with a persistent notification
    // 2. Initialize speech recognition in the service
    // 3. Send recognized commands back to the app
  }

  private async startIOSBackgroundProcessing() {
    // iOS has stricter background limitations
    console.log('Starting iOS background voice processing...');
    
    // This would implement:
    // 1. Background app refresh
    // 2. Short-term background processing tasks
    // 3. Push notifications for wake-up scenarios
  }

  startListening() {
    if (this.recognition && !this.isListening) {
      try {
        this.recognition.start();
      } catch (error) {
        console.error('Failed to start recognition:', error);
      }
    }
  }

  stopListening() {
    this.isListening = false;
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  async enableAlwaysListening() {
    // Request necessary permissions
    const hasPermissions = await this.requestBackgroundPermissions();
    if (!hasPermissions) {
      throw new Error('Background permissions required for always-on listening');
    }

    // Start background service
    await this.startBackgroundListening((command) => {
      if (this.onCommandCallback) {
        this.onCommandCallback(command);
      }
    });

    return true;
  }

  getListeningStatus() {
    return {
      isListening: this.isListening,
      isNative: Capacitor.isNativePlatform(),
      platform: Capacitor.getPlatform(),
      hasRecognition: !!this.recognition
    };
  }
}

export const backgroundVoiceService = BackgroundVoiceService.getInstance();