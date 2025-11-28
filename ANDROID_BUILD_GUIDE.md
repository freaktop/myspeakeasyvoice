# Android Build Guide for SpeakEasy Voice Control

## Overview

This guide explains how to build and install the Android APK for SpeakEasy Voice Control with full system integration capabilities.

## Cloud Build Process (Recommended - No Local Setup Required)

### Option 1: Download from GitHub Releases

1. Go to the [GitHub Releases page](https://github.com/YOUR_USERNAME/routine-voice-pilot/releases)
2. Download the latest `speakeasy-voice-control-debug.apk` file
3. Transfer to your Android device
4. Enable "Unknown Sources" in Android Settings > Security
5. Install the APK
6. Follow the in-app setup guide

### Option 2: Trigger Manual Build

1. Fork this repository to your GitHub account
2. Go to the "Actions" tab in your fork
3. Click "Build Android APK" workflow
4. Click "Run workflow" button
5. Wait for build to complete (5-10 minutes)
6. Download the APK artifact from the completed build

## Features Included in Android Build

### System Integration (Requires Accessibility Service)
- **App Launching**: Voice control to open any installed app
- **Screen Interaction**: Voice commands for scrolling, clicking, tapping
- **System Navigation**: Home, back, recent apps via voice
- **Text Input**: Voice-to-text input in any app or field
- **Background Listening**: Wake phrase detection when app is minimized

### Voice Commands Examples
```
"Hey SpeakEasy, open camera"
"OK SpeakEasy, scroll down" 
"SpeakEasy, go home"
"Hey SpeakEasy, send message hello there"
"OK SpeakEasy, launch YouTube"
"SpeakEasy, go back"
"Hey SpeakEasy, click"
"OK SpeakEasy, type good morning"
```

### Wake Phrases Supported
- "Hey SpeakEasy"
- "OK SpeakEasy"  
- "SpeakEasy"

## Installation Steps

### 1. Install APK
- Download APK from releases or build artifacts
- Enable "Install from Unknown Sources" in Android settings
- Install the APK file

### 2. Initial Setup
- Open SpeakEasy Voice Control app
- Grant microphone permission when prompted
- Follow the Android Setup Guide in the app

### 3. Enable Accessibility Service
- Go to Android Settings > Accessibility
- Find "SpeakEasy Voice Control" 
- Enable the accessibility service
- Grant all requested permissions

### 4. Configure Background Listening (Optional)
- Return to the SpeakEasy app
- Tap "Start Background Listening"  
- Grant any additional permissions requested
- Disable battery optimization for the app (recommended)

### 5. Test Voice Commands
- Try saying "Hey SpeakEasy, open camera"
- Verify the camera app opens
- Test other commands like scrolling and navigation

## Permissions Required

The app requests these permissions for full functionality:

- **Microphone**: For voice recognition
- **Accessibility Service**: For system control and app interaction
- **Display over other apps**: For background operation  
- **Foreground Service**: For continuous voice listening
- **Audio Settings**: For microphone management

## Troubleshooting

### Voice Commands Not Working
1. Check microphone permission is granted
2. Verify accessibility service is enabled
3. Restart the app and try again
4. Check if device has Google Voice Recognition

### Background Listening Issues  
1. Disable battery optimization for SpeakEasy
2. Allow app to run in background
3. Check "Display over other apps" permission
4. Restart accessibility service

### App Installation Problems
1. Enable "Unknown Sources" in Security settings
2. Clear package installer cache
3. Try installing via file manager
4. Check available storage space

## Security & Privacy

- All voice processing happens locally on device
- No voice data is transmitted to external servers
- Accessibility service only responds to predefined commands
- App requires explicit permissions for each capability
- Open source code available for security review

## Build Configuration

The Android build includes:
- Capacitor v7 for native bridge
- Custom accessibility service plugin  
- Background audio processing
- System-level interaction capabilities
- Offline voice recognition support

## Support

For issues or questions:
1. Check the troubleshooting guide above
2. Review the in-app setup instructions
3. File an issue on the GitHub repository
4. Include device model, Android version, and error details

## Technical Details

- **Minimum Android Version**: 7.0 (API 24)
- **Target Android Version**: 14 (API 34)
- **Architecture Support**: ARM64, ARM32
- **APK Size**: ~15-20 MB
- **Permissions**: 8 total permissions required
- **Background Services**: 1 foreground service for voice recognition

The build process uses GitHub Actions with Android SDK 34 and recommends Java JDK 21 (LTS). The CI runs both Java 17 and Java 21 to verify compatibility while ensuring a smooth transition to Java 21.

Local setup: the `scripts/` folder includes helper scripts for setting up JDK 21 and syncing Capacitor native files on Windows: `scripts/install-jdk21.ps1` and `scripts/setup-android.ps1`.

Notes & Recommendations:
- If you don't have JDK 21 installed locally, either use `scripts/install-jdk21.ps1` or configure `JAVA_HOME` to a Java 21 JDK installation.
- Enable Gradle toolchain auto-download by setting `org.gradle.java.installations.auto-download=true` in `android/gradle.properties` to allow Gradle to fetch a suitable JDK automatically.
- The CI workflow runs builds for Java 17 and Java 21 to validate backward compatibility; aim to use Java 21 locally to match the recommended environment.