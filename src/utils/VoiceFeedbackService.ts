import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export interface FeedbackMessage {
  text: string;
  priority?: 'low' | 'medium' | 'high';
  useHaptics?: boolean;
}

export class VoiceFeedbackService {
  private static instance: VoiceFeedbackService;
  private isEnabled = true;
  private speechSynthesis: SpeechSynthesis | null = null;
  private isNative = false;
  private utteranceId = 0;

  constructor() {
    this.isNative = Capacitor.isNativePlatform();
    this.initializeSpeechSynthesis();
  }

  static getInstance(): VoiceFeedbackService {
    if (!VoiceFeedbackService.instance) {
      VoiceFeedbackService.instance = new VoiceFeedbackService();
    }
    return VoiceFeedbackService.instance;
  }

  private initializeSpeechSynthesis() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.speechSynthesis = window.speechSynthesis;
    } else {
      console.warn('Speech synthesis not supported');
    }
  }

  async speak(message: string | FeedbackMessage, options?: { rate?: number; pitch?: number; volume?: number }) {
    if (!this.isEnabled || !this.speechSynthesis) {
      return;
    }

    const feedback = typeof message === 'string' ? { text: message } : message;
    
    try {
      const currentId = ++this.utteranceId;

      // Cancel any ongoing speech
      this.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(feedback.text);
      
      // Configure voice parameters
      utterance.rate = options?.rate || 1.0;
      utterance.pitch = options?.pitch || 1.0;
      utterance.volume = options?.volume || 1.0;
      
      // Select a voice (prefer female voice for assistant feel)
      const voices = this.speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Female') || 
        voice.name.includes('Samantha') || 
        voice.name.includes('Karen') ||
        voice.lang.startsWith('en')
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      // Add haptic feedback for high priority messages
      if (feedback.useHaptics || feedback.priority === 'high') {
        await Haptics.impact({ style: ImpactStyle.Medium });
      }

      await new Promise<void>((resolve) => {
        utterance.onend = () => resolve();
        utterance.onerror = (event) => {
          // Treat all speech synthesis errors as non-fatal.
          // Browsers commonly emit errors when we cancel speech to play a new utterance,
          // and some implementations provide little/no error detail.

          // If a newer utterance started, ignore.
          if (currentId !== this.utteranceId) {
            resolve();
            return;
          }

          // Log only if this was the active utterance and it wasn't a normal cancel.
          if (event.error && event.error !== 'interrupted' && event.error !== 'canceled') {
            console.error('Speech synthesis error:', event);
          }
          resolve();
        };

        this.speechSynthesis.speak(utterance);
      });
    } catch (error) {
      // Swallow expected cancellation errors so they don't become unhandled rejections.
      if (error && typeof error === 'object' && 'error' in error) {
        const e = error as SpeechSynthesisErrorEvent;
        if (e.error === 'interrupted' || e.error === 'canceled') {
          return;
        }
      }
      console.error('Failed to speak message:', error);
    }
  }

  // Predefined feedback messages
  async confirmCommand(command: string) {
    await this.speak(`Executing ${command}`, {});
  }

  async commandSuccess(command: string) {
    await this.speak(`${command} completed successfully`, {});
  }

  async commandFailed(command: string) {
    await this.speak(`Failed to execute ${command}`, {});
  }

  async wakePhraseDetected() {
    await this.speak('Yes?', {});
    await Haptics.impact({ style: ImpactStyle.Medium });
  }

  async listeningStarted() {
    await this.speak('Listening...', {});
  }

  async listeningStopped() {
    await this.speak('Voice control stopped', {});
  }

  async accessibilityRequired() {
    await this.speak('Accessibility service is required for this command', {});
  }

  async permissionDenied() {
    await this.speak('Microphone permission denied', {});
    await Haptics.impact({ style: ImpactStyle.Heavy });
  }

  async helpMessage() {
    const helpText = `
      Available voice commands include: 
      Open apps, type text, search the web, control media, 
      adjust settings, take screenshots, and navigate your device.
      Say "help" anytime to hear this message again.
    `;
    await this.speak(helpText, { rate: 0.9 });
  }

  async batteryOptimization() {
    await this.speak('Battery optimization mode enabled', {});
  }

  async errorOccurred(error: string) {
    await this.speak(`An error occurred: ${error}`, {});
    await Haptics.impact({ style: ImpactStyle.Heavy });
  }

  async noCommandDetected() {
    await this.speak("I didn't catch that. Please try again.", {});
  }

  async welcomeMessage() {
    await this.speak('SpeakEasy voice control is ready. Say "Hey SpeakEasy" to start.', {});
  }

  // Utility methods
  enable() {
    this.isEnabled = true;
  }

  disable() {
    this.isEnabled = false;
    if (this.speechSynthesis) {
      this.speechSynthesis.cancel();
    }
  }

  toggle() {
    if (this.isEnabled) {
      this.disable();
    } else {
      this.enable();
    }
    return this.isEnabled;
  }

  isSpeaking(): boolean {
    return this.speechSynthesis?.speaking || false;
  }

  stopSpeaking() {
    if (this.speechSynthesis) {
      this.speechSynthesis.cancel();
    }
  }

  getStatus() {
    return {
      isEnabled: this.isEnabled,
      isSupported: !!this.speechSynthesis,
      isSpeaking: this.isSpeaking(),
      isNative: this.isNative,
      availableVoices: this.speechSynthesis?.getVoices().length || 0
    };
  }
}

export const voiceFeedbackService = VoiceFeedbackService.getInstance();
