// Voice feedback system for providing audio responses to users
import { logger } from './logger';

export interface VoiceFeedbackSettings {
  enabled: boolean;
  voice: 'male' | 'female' | 'system';
  rate: number; // 0.5 to 2.0
  pitch: number; // 0 to 2
  volume: number; // 0 to 1
}

export class VoiceFeedbackService {
  private static instance: VoiceFeedbackService;
  private synthesis: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private settings: VoiceFeedbackSettings;

  private constructor() {
    this.settings = {
      enabled: true,
      voice: 'female',
      rate: 1.0,
      pitch: 1.0,
      volume: 0.8
    };

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
      this.loadVoices();
      
      // Handle voice loading (Chrome loads voices asynchronously)
      if (this.synthesis.onvoiceschanged !== undefined) {
        this.synthesis.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  public static getInstance(): VoiceFeedbackService {
    if (!VoiceFeedbackService.instance) {
      VoiceFeedbackService.instance = new VoiceFeedbackService();
    }
    return VoiceFeedbackService.instance;
  }

  private loadVoices(): void {
    if (this.synthesis) {
      this.voices = this.synthesis.getVoices();
      logger.log('Available voices:', this.voices.length);
    }
  }

  private getPreferredVoice(): SpeechSynthesisVoice | null {
    if (this.voices.length === 0) return null;

    // Try to find a voice based on user preference
    const { voice } = this.settings;
    
    let preferredVoices: string[] = [];
    
    if (voice === 'female') {
      preferredVoices = ['Google UK English Female', 'Microsoft Zira', 'Samantha', 'Victoria', 'Karen', 'female'];
    } else if (voice === 'male') {
      preferredVoices = ['Google UK English Male', 'Microsoft David', 'Alex', 'Daniel', 'Tom', 'male'];
    }

    // First, try to find exact matches
    for (const voiceName of preferredVoices) {
      const found = this.voices.find(v => 
        v.name.toLowerCase().includes(voiceName.toLowerCase())
      );
      if (found) return found;
    }

    // Fallback to any English voice
    const englishVoice = this.voices.find(v => 
      v.lang.startsWith('en-') && v.localService
    );
    if (englishVoice) return englishVoice;

    // Last resort: first available voice
    return this.voices[0] || null;
  }

  public updateSettings(newSettings: Partial<VoiceFeedbackSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
  }

  public speak(text: string, options?: Partial<VoiceFeedbackSettings>): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis || !this.settings.enabled) {
        resolve();
        return;
      }

      // Cancel any ongoing speech
      this.synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      const voice = this.getPreferredVoice();
      
      if (voice) {
        utterance.voice = voice;
      }

      // Apply settings
      const currentSettings = { ...this.settings, ...options };
      utterance.rate = currentSettings.rate;
      utterance.pitch = currentSettings.pitch;
      utterance.volume = currentSettings.volume;

      utterance.onend = () => resolve();
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        reject(new Error('Speech synthesis failed'));
      };

      this.synthesis.speak(utterance);
    });
  }

  public stop(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }

  public async speakCommandConfirmation(command: string, action: string): Promise<void> {
    if (!this.settings.enabled) return;

    // Create contextual responses
    const responses = [
      `${action}`,
      `Got it, ${action.toLowerCase()}`,
      `Done. ${action}`,
      `Command executed: ${action.toLowerCase()}`
    ];

    const response = responses[Math.floor(Math.random() * responses.length)];
    
    try {
      await this.speak(response, { rate: 1.1, volume: 0.7 });
    } catch (error) {
      console.warn('Voice feedback failed:', error);
    }
  }

  public async speakError(error: string): Promise<void> {
    if (!this.settings.enabled) return;

    const errorResponses = [
      `Sorry, ${error.toLowerCase()}`,
      `I couldn't ${error.toLowerCase()}`,
      `Error: ${error.toLowerCase()}`,
      `Unable to complete that. ${error.toLowerCase()}`
    ];

    const response = errorResponses[Math.floor(Math.random() * errorResponses.length)];
    
    try {
      await this.speak(response, { rate: 0.9, pitch: 0.8 });
    } catch (error) {
      console.warn('Error voice feedback failed:', error);
    }
  }

  public async speakWelcome(): Promise<void> {
    if (!this.settings.enabled) return;

    const welcomeMessages = [
      "Voice assistant activated. How can I help you?",
      "SpeakEasy is ready. What would you like to do?",
      "Voice commands are now active. Try saying a command.",
      "Hello! I'm listening for your voice commands."
    ];

    const message = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
    
    try {
      await this.speak(message, { rate: 1.0 });
    } catch (error) {
      console.warn('Welcome voice feedback failed:', error);
    }
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }
}

// Export singleton instance
export const voiceFeedback = VoiceFeedbackService.getInstance();