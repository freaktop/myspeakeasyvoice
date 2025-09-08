# Capacitor Android Accessibility Plugin

This plugin provides Android accessibility service capabilities for SpeakEasy Voice Control.

## Features

- System-level app launching
- Screen interaction (scrolling, clicking)  
- Text input and messaging
- Global navigation actions
- Background voice recognition
- Accessibility service integration

## Installation

This plugin is automatically included when building the Android app via GitHub Actions.

## Usage

The plugin is automatically registered and available through the `AccessibilityService` import in the TypeScript code.

## Permissions

The following permissions are automatically added to the Android manifest:

- `android.permission.ACCESSIBILITY_SERVICE`
- `android.permission.BIND_ACCESSIBILITY_SERVICE` 
- `android.permission.RECORD_AUDIO`
- `android.permission.FOREGROUND_SERVICE`
- `android.permission.FOREGROUND_SERVICE_MICROPHONE`
- `android.permission.SYSTEM_ALERT_WINDOW`

## Setup

1. Install the APK from GitHub Releases
2. Open the app and follow the setup guide
3. Enable accessibility service in Android Settings
4. Grant microphone permissions
5. Start using voice commands

## Voice Commands

### App Control
- "Hey SpeakEasy, open camera"
- "OK SpeakEasy, launch YouTube"
- "SpeakEasy, start settings"

### Navigation  
- "SpeakEasy, go home"
- "Hey SpeakEasy, go back"
- "OK SpeakEasy, show recent apps"

### Interaction
- "SpeakEasy, scroll down"
- "Hey SpeakEasy, click"
- "OK SpeakEasy, scroll up"

### Messaging
- "SpeakEasy, send message hello there"
- "Hey SpeakEasy, type good morning"

## Background Listening

Once properly configured, the app can listen for wake phrases even when minimized or when the screen is off (depending on device power management settings).

## Troubleshooting

If voice commands aren't working:

1. Check accessibility service is enabled in Android Settings
2. Verify microphone permissions are granted
3. Ensure the app isn't being killed by battery optimization
4. Try restarting the accessibility service
5. Check the app has permission for "Display over other apps"

## Security

The accessibility service only responds to predefined voice commands and wake phrases. No personal data is transmitted or stored beyond the local device.