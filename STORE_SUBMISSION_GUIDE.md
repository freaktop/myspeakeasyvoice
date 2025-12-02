# App Store Submission Guide

This guide covers the steps needed to submit Routine Voice Pilot to Google Play Store and Apple App Store.

## Pre-Submission Checklist

### ✅ Code & Build
- [x] Java 21 upgrade complete
- [x] App builds successfully (`./gradlew assembleDebug`)
- [ ] All tests passing
- [ ] No critical bugs or crashes
- [ ] Performance optimized
- [ ] Battery usage optimized

### ✅ Legal & Privacy
- [x] Privacy Policy page implemented (`src/pages/PrivacyPolicyPage.tsx`)
- [ ] Privacy Policy hosted publicly (required URL)
- [ ] Terms of Service created
- [ ] User data handling documented
- [ ] Permissions justified in store listing

### ✅ Assets & Branding
- [ ] App icon (512x512 PNG, no transparency for Play Store)
- [ ] Feature graphic (1024x500 JPG/PNG for Play Store)
- [ ] Screenshots (minimum 2, recommended 4-8)
  - Phone: 16:9 or 9:16 ratio
  - Tablet: optional but recommended
- [ ] App description (short & full)
- [ ] Promo video (optional but recommended)

---

## Google Play Store Submission

### 1. Create Release Signing Key

```powershell
# Navigate to android folder
cd android

# Generate release keystore (DO THIS ONCE, KEEP IT SAFE!)
keytool -genkey -v -keystore release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias release-key

# You'll be prompted for:
# - Keystore password (remember this!)
# - Key password (can be same as keystore)
# - Your name, organization, etc.
```

**⚠️ CRITICAL**: Back up `release-key.jks` securely! You cannot update your app without it.

### 2. Configure Signing

Create `android/gradle.properties` (local, DO NOT commit):

```properties
RELEASE_STORE_FILE=release-key.jks
RELEASE_STORE_PASSWORD=your_store_password
RELEASE_KEY_ALIAS=release-key
RELEASE_KEY_PASSWORD=your_key_password
```

Or use environment variables (recommended for CI/CD):

```powershell
$env:RELEASE_STORE_FILE="C:\path\to\release-key.jks"
$env:RELEASE_STORE_PASSWORD="your_password"
$env:RELEASE_KEY_ALIAS="release-key"
$env:RELEASE_KEY_PASSWORD="your_key_password"
```

### 3. Build Release Bundle

```powershell
cd android

# Build AAB (Android App Bundle - preferred by Google Play)
.\gradlew.bat bundleRelease

# Or build APK
.\gradlew.bat assembleRelease

# Output locations:
# AAB: android/app/build/outputs/bundle/release/app-release.aab
# APK: android/app/build/outputs/apk/release/app-release.apk
```

### 4. Google Play Console Setup

1. **Create Developer Account**
   - Go to [Google Play Console](https://play.google.com/console)
   - Pay one-time $25 registration fee
   - Complete identity verification

2. **Create New App**
   - Click "Create app"
   - Enter app details:
     - Name: "Routine Voice Pilot"
     - Default language: English (US)
     - App or game: App
     - Free or paid: Free (or Paid)

3. **Complete Store Listing**
   - **App details**:
     - Short description (80 chars max)
     - Full description (4000 chars max)
     - App icon (512x512)
     - Feature graphic (1024x500)
     - Screenshots (2-8 images)
   
   - **Categorization**:
     - App category: Productivity (or Tools)
     - Tags: voice control, accessibility, productivity
   
   - **Contact details**:
     - Email address
     - Website (optional)
     - Privacy policy URL (REQUIRED)

4. **Set Up App Content**
   - **Privacy Policy**: Link to hosted privacy policy
   - **Ads**: Declare if app contains ads (No)
   - **Target audience**: Choose age groups
   - **News apps**: Not a news app
   - **COVID-19**: Not related
   - **Data safety**: Fill out data collection form
     - Collects: Voice recordings (if stored)
     - Location: No (unless used)
     - Purpose: App functionality

5. **Upload Release Bundle**
   - Go to "Production" → "Create new release"
   - Upload `app-release.aab`
   - Add release notes
   - Review and rollout

### 5. Required Permissions Justification

Your app uses sensitive permissions - Google requires detailed explanations:

- **RECORD_AUDIO**: "Voice command recognition and control"
- **BIND_ACCESSIBILITY_SERVICE**: "System-level voice control for accessibility"
- **SYSTEM_ALERT_WINDOW**: "Display voice command feedback overlay"

Provide a video demo showing these features in use.

---

## Apple App Store (iOS)

### 1. Set Up iOS Platform

```powershell
# Install iOS platform
npx cap add ios

# Sync web assets
npx cap sync ios

# Open in Xcode
npx cap open ios
```

### 2. Xcode Configuration

1. **Sign & Capabilities**
   - Select your team/Apple ID
   - Set bundle identifier: `com.lovable.routinevoicepilot`
   - Enable required capabilities:
     - Microphone usage
     - Speech recognition

2. **Info.plist Privacy Descriptions**
   - `NSMicrophoneUsageDescription`: "We need microphone access for voice commands"
   - `NSSpeechRecognitionUsageDescription`: "We use speech recognition for voice control"

3. **App Icons**
   - Add all required icon sizes in Assets.xcassets

### 3. App Store Connect

1. **Enroll in Apple Developer Program**
   - Cost: $99/year
   - Go to [developer.apple.com](https://developer.apple.com)

2. **Create App in App Store Connect**
   - Go to [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
   - Click "+" → "New App"
   - Fill in details:
     - Platform: iOS
     - Name: Routine Voice Pilot
     - Primary language: English
     - Bundle ID: com.lovable.routinevoicepilot
     - SKU: unique identifier

3. **Prepare App Information**
   - Screenshots (required for all supported device sizes)
   - App description
   - Keywords
   - Support URL
   - Privacy Policy URL

4. **Archive & Upload**
   ```
   In Xcode:
   Product → Archive
   → Upload to App Store
   ```

5. **Submit for Review**
   - Complete all required fields
   - Submit to App Review
   - Wait for approval (typically 1-3 days)

---

## Testing Before Submission

### Internal Testing
```powershell
# Build and test on multiple devices
.\gradlew.bat installRelease

# Test on different Android versions (minimum API 23/Android 6.0)
# Test on different screen sizes
```

### Beta Testing

**Google Play (Internal Testing)**:
- Upload to "Internal testing" track
- Add testers via email
- Share testing link

**Apple (TestFlight)**:
- Upload build via Xcode
- Add internal/external testers
- Share TestFlight link

---

## Post-Submission

### Monitor Reviews
- Respond to user feedback
- Fix critical bugs quickly

### Update Strategy
```powershell
# Increment version for updates
# In android/app/build.gradle:
versionCode 3  # Increment by 1
versionName "1.2.0"  # Follow semantic versioning

# Build and upload new release
.\gradlew.bat bundleRelease
```

### Analytics (Optional)
- Add Google Analytics or Firebase Analytics
- Track user engagement
- Monitor crash reports

---

## Helpful Commands Summary

```powershell
# Debug build & test
cd android
.\gradlew.bat assembleDebug
.\gradlew.bat installDebug

# Release build (after signing configured)
.\gradlew.bat bundleRelease
.\gradlew.bat assembleRelease

# Install release APK to device
adb install -r app/build/outputs/apk/release/app-release.apk

# View signing info
keytool -list -v -keystore release-key.jks

# Increase version (edit build.gradle)
# versionCode 2 → 3
# versionName "1.0" → "1.1.0"
```

---

## Resources

- [Google Play Console](https://play.google.com/console)
- [Play Store Launch Checklist](https://developer.android.com/distribute/best-practices/launch/launch-checklist)
- [App Store Connect](https://appstoreconnect.apple.com)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Capacitor iOS Setup](https://capacitorjs.com/docs/ios)

---

**Last Updated**: 2025-12-01
