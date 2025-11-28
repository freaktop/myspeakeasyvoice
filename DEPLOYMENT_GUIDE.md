# SpeakEasy Voice Assistant - Complete Deployment Guide

## 🚀 App Deployment Status

✅ **Web App Ready** - Fully functional with voice recognition, user authentication, and command management
✅ **Mobile Features** - Native Capacitor integration with system-level voice commands
✅ **Database** - Supabase backend with user profiles, voice commands, and command history
✅ **Authentication** - Secure user login/signup system

---

## 📱 Mobile App Deployment (Capacitor)

### Prerequisites
 - Node.js 18+ installed
 - For iOS: macOS with Xcode 14+
 - For Android: Android Studio with SDK 33+ and Java JDK 21+

### Step 1: Export & Clone Project
1. Click **"Export to Github"** in Lovable interface
2. Clone your repository locally:
```bash
git clone <your-repo-url>
cd routine-voice-pilot
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Build Web App
```bash
npm run build
```

### Step 4: Add Mobile Platforms

**For Android:**
```bash
npx cap add android
```

**For iOS (macOS only):**
```bash
npx cap add ios
```

### Step 5: Update Platform Dependencies
```bash
# Update Android
npx cap update android

# Update iOS (if applicable)
npx cap update ios
```

### Step 6: Sync Project to Native Platforms
```bash
npx cap sync
```

### Step 7: Configure Permissions

#### Android Permissions
Edit `android/app/src/main/AndroidManifest.xml` and add these permissions inside the `<manifest>` tag:

```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.QUERY_ALL_PACKAGES" />
<uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
```

#### iOS Permissions
Edit `ios/App/App/Info.plist` and add these keys:

```xml
<key>NSMicrophoneUsageDescription</key>
<string>This app uses microphone for voice commands and system control</string>
<key>NSCameraUsageDescription</key>
<string>This app uses camera for photo capture via voice commands</string>
<key>NSContactsUsageDescription</key>
<string>This app accesses contacts to send messages via voice commands</string>
<key>NSLocationWhenInUseUsageDescription</key>
<string>This app uses location for location-based voice commands</string>
```

### Step 8: Build & Run on Device/Emulator

#### Android
```bash
# Run on connected device or emulator
npx cap run android

# Or build APK for distribution
npx cap build android
```

#### iOS
```bash
# Run on connected device or simulator (macOS only)
npx cap run ios

# Or open in Xcode for building
npx cap open ios
```

---

## ⚙️ Environment Setup for Java/Android

### Install Java JDK 21
1. Download from [Oracle JDK](https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html)
2. Install and set environment variables:

**Windows:**
```cmd
set JAVA_HOME=C:\Program Files\Java\jdk-21
set PATH=%JAVA_HOME%\bin;%PATH%
```

**macOS/Linux:**
```bash
export JAVA_HOME=/path/to/jdk-21
export PATH=$JAVA_HOME/bin:$PATH
```

### Install Android Studio
1. Download from [Android Studio](https://developer.android.com/studio)
2. During installation, ensure these components are installed:
   - Android SDK
   - Android SDK Platform
   - Android Virtual Device
3. Set Android SDK path in environment variables

---

## 🌐 Web Deployment

### Deploy to Lovable Hosting
1. Click **"Publish"** button in Lovable interface
2. Choose your domain settings
3. App will be live at `your-domain.lovable.app`

### Deploy to Custom Domain
1. Go to Project Settings → Domains in Lovable
2. Connect your custom domain
3. Follow DNS configuration instructions

---

## 🔧 App Features & Testing

### Core Features Working ✅
- **Voice Recognition**: Web Speech API with error handling
- **User Authentication**: Supabase Auth with profiles
- **Voice Commands**: Personal & Professional modes
- **Command History**: Tracked in database
- **Settings Management**: User preferences & voice settings
- **Mobile Integration**: Native app launching, scrolling, navigation
- **Background Listening**: Mobile-only continuous voice detection

### Test All Buttons & Features:

#### HomePage
- ✅ Microphone button starts/stops listening
- ✅ Mode toggle switches between Personal/Professional
- ✅ Navigation tabs work (Voice Control, System Commands, History)
- ✅ Quick action cards navigate to correct pages
- ✅ Sign out button works

#### Settings Page
- ✅ Profile updates save to database
- ✅ Voice settings (wake phrase, sensitivity) update
- ✅ Mode preference changes affect homepage
- ✅ Privacy/Terms links work

#### Routines Page
- ✅ Add new voice commands
- ✅ Edit existing commands
- ✅ Delete commands with confirmation
- ✅ Toggle command active/inactive status

#### System Commands (Mobile)
- ✅ Test native commands (open apps, scroll, navigate)
- ✅ Shows web fallbacks when not on mobile
- ✅ Proper error handling for unsupported commands

---

## 🛠️ Development Workflow

1. **Make changes in Lovable**
2. **Git pull latest changes** to local repository
3. **Build and sync:**
   ```bash
   npm run build
   npx cap sync
   ```
4. **Test on device:**
   ```bash
   npx cap run android  # or ios
   ```

---

## 🐛 Troubleshooting

### Voice Recognition Issues
- Ensure microphone permissions are granted
- Check browser compatibility (Chrome recommended)
- Verify HTTPS is enabled for production

### Android Build Errors
- Verify Java 21 is installed and JAVA_HOME is set
- Update Android Studio and SDK components
- Clean build: `cd android && ./gradlew clean`

### Local setup helper scripts (Windows)

To simplify a local Android build on Windows, we provide helper PowerShell scripts under `scripts/`:

- `scripts/install-jdk21.ps1` — attempts to install Temurin JDK 21 using `winget` (if present), or prints instructions to install and set `JAVA_HOME`.
- `scripts/setup-android.ps1` — installs node modules and runs `npx cap sync android` to pull native libs into the Android project.

Usage from PowerShell (run as admin when installing JDK):

```powershell
# Attempt an automated JDK install via winget
.\scripts\install-jdk21.ps1

# Setup the android project (npm ci + sync)
.\scripts\setup-android.ps1

# Build android (after setting JAVA_HOME if necessary)
cd android
.\gradlew.bat clean assembleDebug --no-daemon --stacktrace --info
```

### iOS Build Errors
- Ensure Xcode is updated to latest version
- Check iOS deployment target compatibility
- Verify Apple Developer account for device testing

### App Not Opening on Mobile
- Check if target apps are installed on device
- Verify permissions are granted in device settings
- Check device logs for permission errors

---

## 📈 Next Steps

1. **Test thoroughly** on target devices
2. **Configure app icons** and splash screens in native projects
3. **Set up app store accounts** (Google Play, Apple App Store)
4. **Implement analytics** for usage tracking
5. **Add push notifications** for enhanced UX

---

## 📞 Support

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Lovable Blog Post](https://lovable.dev/blogs/TODO) for mobile capabilities
- [Supabase Documentation](https://supabase.com/docs)

Your SpeakEasy voice assistant is now ready for deployment! 🎉