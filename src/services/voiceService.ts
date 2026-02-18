import { SpeechRecognition } from '@capacitor-community/speech-recognition';
import { TextToSpeech } from '@capacitor-community/text-to-speech';

export class VoiceService {
  
  async requestPermissions(): Promise<boolean> {
    try {
      const { granted } = await SpeechRecognition.requestPermissions();
      return granted;
    } catch (error) {
      console.error('Permission error:', error);
      return false;
    }
  }

  async startListening(callback: (text: string) => void): Promise<void> {
    try {
      await SpeechRecognition.start({
        language: 'en-US',
        maxResults: 5,
        prompt: 'Say a command',
        partialResults: true,
        popup: false,
      });

      SpeechRecognition.addListener('partialResults', (data: any) => {
        if (data.matches && data.matches.length > 0) {
          callback(data.matches[0]);
        }
      });

    } catch (error) {
      console.error('Speech recognition error:', error);
    }
  }

  async stopListening(): Promise<void> {
    await SpeechRecognition.stop();
  }

  async speak(text: string): Promise<void> {
    await TextToSpeech.speak({
      text: text,
      lang: 'en-US',
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0,
      category: 'ambient',
    });
  }

  async stopSpeaking(): Promise<void> {
    await TextToSpeech.stop();
  }
}

export const voiceService = new VoiceService();