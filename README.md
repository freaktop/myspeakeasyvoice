# SpeakEasy Voice Control

A powerful voice-controlled assistant app that works on both web and mobile platforms, with full Android system integration capabilities.

## 🎯 Features

### Web Version
- Voice command recognition with customizable wake phrases
- Basic voice-controlled app functions  
- User authentication and profile management
- Command history and analytics
- Personal and professional mode switching

### Android Mobile Version
- **Full System Integration** via Android Accessibility Service
- **Background Voice Listening** - responds to wake phrases even when minimized
- **App Launching** - "Hey SpeakEasy, open camera"
- **System Navigation** - "OK SpeakEasy, go home"
- **Screen Interaction** - "SpeakEasy, scroll down" 
- **Text Input** - "Hey SpeakEasy, type hello world"
- **Always-On Recognition** - works even when screen is off (device permitting)

## 🚀 Quick Start

### Web Version
1. Visit the [live app](https://ubiquitous-dodol-eafe6f.netlify.app)
2. Sign up and grant microphone permissions
3. Start using voice commands with your chosen wake phrase

### Android Version (Full Features)
1. Download the latest APK from [GitHub Releases](https://github.com/YOUR_USERNAME/routine-voice-pilot/releases)
2. Install on your Android device (enable "Unknown Sources")
3. Open the app and follow the Android Setup Guide
4. Enable Accessibility Service for system control
5. Grant microphone and background permissions
6. Start using advanced voice commands

## 📱 Android Installation

For the complete system integration experience, install the Android APK:

### Download & Install
The Android APK is automatically built via GitHub Actions when you push code or create releases.

### Setup Process
1. **Install APK** - Enable unknown sources and install
2. **Grant Permissions** - Microphone, accessibility, display overlay
3. **Enable Accessibility** - Settings > Accessibility > SpeakEasy Voice Control
4. **Test Commands** - Try "Hey SpeakEasy, open camera"

See [ANDROID_BUILD_GUIDE.md](./ANDROID_BUILD_GUIDE.md) for detailed instructions.

## 🎙️ Voice Commands

### Wake Phrases
- "Hey SpeakEasy"
- "OK SpeakEasy"
- "SpeakEasy"

### App Control (Android)
```
"Hey SpeakEasy, open [app name]"
"OK SpeakEasy, launch YouTube"  
"SpeakEasy, start settings"
```

### System Navigation (Android)
```
"SpeakEasy, go home"
"Hey SpeakEasy, go back"
"OK SpeakEasy, show recent apps"
```

### Screen Interaction (Android)
```
"SpeakEasy, scroll down"
"Hey SpeakEasy, scroll up"  
"OK SpeakEasy, click"
"SpeakEasy, tap center"
```

### Text & Messaging (Android)
```
"SpeakEasy, send message hello there"
"Hey SpeakEasy, type good morning"
"OK SpeakEasy, text mom I'm running late"
```

## 🛠️ Development

### Local Development
```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
npm install
npm run dev
```

### Android Build (Cloud)
The Android APK is automatically built via GitHub Actions:

1. Push to main branch or manually trigger workflow
2. Download APK from Actions artifacts or Releases
3. No local Android SDK setup required

### Technologies Used
- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Supabase (Auth, Database, Edge Functions)
- **Mobile**: Capacitor v7 with custom accessibility plugin
- **Voice**: Web Speech API + Android native speech recognition
- **UI**: shadcn/ui components

## 🔒 Security & Privacy

- All voice processing happens locally on your device
- No voice data is transmitted to external servers
- Accessibility service only responds to predefined commands
- Open source code available for security review
- Supabase provides secure authentication and data storage

## 📄 Documentation

- [Android Build Guide](./ANDROID_BUILD_GUIDE.md) - Complete Android setup
- [Mobile Setup](./MOBILE_SETUP.md) - Mobile development guide
- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Production deployment

## 🆘 Support

### Troubleshooting
- **Voice not working**: Check microphone permissions
- **Android commands failing**: Verify accessibility service enabled
- **Background listening issues**: Disable battery optimization

### Get Help
- File issues on GitHub with device model, OS version, and error details
- Check the troubleshooting guides first

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/84424d2b-0ee9-46f8-8ff0-7ac94de71049) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can! To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

---

**Built with Lovable** - The AI-powered development platform
