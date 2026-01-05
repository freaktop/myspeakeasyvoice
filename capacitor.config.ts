import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.speakeasy.voiceassistant', // TODO: Change to your unique app ID
  appName: 'SpeakEasy Voice Control',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https', // Use HTTPS in production
    // For development, uncomment and set your dev server URL:
    // url: 'http://YOUR_IP:5173',
    // cleartext: true,
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#488AFF',
      sound: 'beep.wav',
    },
    SpeechRecognition: {
      language: 'en-US',
      maxResults: 5,
      prompt: 'Say a command',
      partialResults: true,
      popup: false,
    },
    StatusBar: {
      style: 'Dark',
      backgroundColor: '#000000',
    },
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#000000',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
    },
  },
  android: {
    allowMixedContent: false, // Set to false for production
    captureInput: true,
    webContentsDebuggingEnabled: false, // Set to false for production
  },
};

export default config;
