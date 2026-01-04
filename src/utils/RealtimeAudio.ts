// Audio recording and encoding utilities for OpenAI Realtime API
import { logger } from './logger';

export class AudioRecorder {
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;

  constructor(private onAudioData: (audioData: Float32Array) => void) {}

  async start() {
    try {
      logger.log("Starting audio recording...");
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      this.audioContext = new AudioContext({
        sampleRate: 24000,
      });
      
      this.source = this.audioContext.createMediaStreamSource(this.stream);
      this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);
      
      this.processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        this.onAudioData(new Float32Array(inputData));
      };
      
      this.source.connect(this.processor);
      this.processor.connect(this.audioContext.destination);
      
      logger.log("Audio recording started successfully");
    } catch (error) {
      console.error('Error accessing microphone:', error);
      throw error;
    }
  }

  stop() {
    logger.log("Stopping audio recording...");
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

// Encode Float32Array to base64 PCM16 for OpenAI API
export const encodeAudioForAPI = (float32Array: Float32Array): string => {
  const int16Array = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  
  const uint8Array = new Uint8Array(int16Array.buffer);
  let binary = '';
  const chunkSize = 0x8000;
  
  for (let i = 0; i < uint8Array.length; i += chunkSize) {
    const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  
  return btoa(binary);
};

// Create WAV file from PCM data for playback
export const createWavFromPCM = (pcmData: Uint8Array): Uint8Array => {
  logger.log("Creating WAV from PCM data, length:", pcmData.length);
  
  // Convert bytes to 16-bit samples (little endian)
  const int16Data = new Int16Array(pcmData.length / 2);
  for (let i = 0; i < pcmData.length; i += 2) {
    int16Data[i / 2] = (pcmData[i + 1] << 8) | pcmData[i];
  }
  
  // Create WAV header
  const wavHeader = new ArrayBuffer(44);
  const view = new DataView(wavHeader);
  
  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  // WAV header parameters
  const sampleRate = 24000;
  const numChannels = 1;
  const bitsPerSample = 16;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const byteRate = sampleRate * blockAlign;

  // Write WAV header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + int16Data.byteLength, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // PCM format size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(view, 36, 'data');
  view.setUint32(40, int16Data.byteLength, true);

  // Combine header and data
  const wavArray = new Uint8Array(wavHeader.byteLength + int16Data.byteLength);
  wavArray.set(new Uint8Array(wavHeader), 0);
  wavArray.set(new Uint8Array(int16Data.buffer), wavHeader.byteLength);
  
  return wavArray;
};

// Audio queue for sequential playback
export class AudioQueue {
  private queue: Uint8Array[] = [];
  private isPlaying = false;
  private audioContext: AudioContext;

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
    console.log("AudioQueue initialized");
  }

  async addToQueue(audioData: Uint8Array) {
    logger.log("Adding audio to queue, size:", audioData.length);
    this.queue.push(audioData);
    if (!this.isPlaying) {
      await this.playNext();
    }
  }

  private async playNext() {
    if (this.queue.length === 0) {
      this.isPlaying = false;
      logger.log("Audio queue empty, stopping playback");
      return;
    }

    this.isPlaying = true;
    const audioData = this.queue.shift()!;
    logger.log("Playing next audio chunk, size:", audioData.length);

    try {
      const wavData = createWavFromPCM(audioData);
      const audioBuffer = await this.audioContext.decodeAudioData(wavData.buffer);
      
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);
      
      source.onended = () => {
        logger.log("Audio chunk finished");
        this.playNext();
      };
      
      source.start(0);
    } catch (error) {
      console.error('Error playing audio chunk:', error);
      this.playNext(); // Continue with next segment even if current fails
    }
  }

  clear() {
    logger.log("Clearing audio queue");
    this.queue = [];
    this.isPlaying = false;
  }
}

// Singleton audio playback helper
let audioQueueInstance: AudioQueue | null = null;

export const playAudioData = async (audioContext: AudioContext, audioData: Uint8Array) => {
  if (!audioQueueInstance) {
    audioQueueInstance = new AudioQueue(audioContext);
  }
  await audioQueueInstance.addToQueue(audioData);
};

export const clearAudioQueue = () => {
  audioQueueInstance?.clear();
};