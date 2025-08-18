# Mobile App Setup Instructions

This SpeakEasy voice control app is configured for Capacitor mobile deployment. Follow these steps to build and run on mobile devices:

## Prerequisites
- Node.js 18+ installed
- For iOS: macOS with Xcode 14+
- For Android: Android Studio with SDK 33+

## Setup Steps

### 1. Export & Clone Project
1. Click "Export to Github" in Lovable
2. Clone your repository locally:
```bash
git clone <your-repo-url>
cd routine-voice-pilot
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Add Mobile Platforms
```bash
# For Android
npx cap add android

# For iOS (macOS only)
npx cap add ios
```

### 4. Update Platform Dependencies
```bash
npx cap update android
npx cap update ios
```

### 5. Build the Web App
```bash
npm run build
```

### 6. Sync to Native Platforms
```bash
npx cap sync
```

### 7. Configure Permissions

#### Android (`android/app/src/main/AndroidManifest.xml`):
```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.QUERY_ALL_PACKAGES" />
```

#### iOS (`ios/App/App/Info.plist`):
```xml
<key>NSMicrophoneUsageDescription</key>
<string>This app uses microphone for voice commands</string>
<key>NSCameraUsageDescription</key>
<string>This app uses camera for photo capture</string>
```

### 8. Run on Device/Emulator
```bash
# Android
npx cap run android

# iOS
npx cap run ios
```

## Features Available on Mobile
- ✅ Voice recognition with microphone access
- ✅ App launching (open camera, settings, etc.)
- ✅ Native haptic feedback
- ✅ Photo capture
- ✅ Content sharing
- ✅ Background voice processing

## Development Workflow
1. Make changes in Lovable
2. Git pull latest changes
3. Run `npm run build && npx cap sync`
4. Test on device with `npx cap run android/ios`

## Troubleshooting
- If voice recognition fails: Check microphone permissions
- If app launching fails: Verify target apps are installed
- Build errors: Ensure native dependencies are updated with `npx cap update`

For more help, see: https://capacitorjs.com/docs