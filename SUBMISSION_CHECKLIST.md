# App Store Submission Checklist

Quick reference checklist for submitting Routine Voice Pilot to app stores.

## ☑️ Pre-Submission Tasks

### Development
- [x] Java 21 upgrade complete
- [x] App builds successfully
- [x] Version updated to 1.1.0 (versionCode 2)
- [ ] All features tested on emulator/device
- [ ] Performance & battery optimized
- [ ] Memory leaks checked
- [ ] No crashes or critical bugs

### Legal Documents
- [x] Privacy Policy implemented in app
- [ ] Privacy Policy hosted online (get public URL)
- [ ] Terms of Service created (if needed)
- [ ] Data collection documented

### Assets Needed

#### Both Stores
- [ ] App icon 512x512 PNG (no transparency)
- [ ] Screenshots (4-8 images recommended):
  - [ ] Home screen
  - [ ] Voice command in action
  - [ ] Settings/permissions screen
  - [ ] Success/results screen
- [ ] Short description (80 chars)
- [ ] Full description (500-4000 chars)
- [ ] App category selected: Productivity/Tools
- [ ] Keywords/tags defined

#### Google Play Only
- [ ] Feature graphic 1024x500 JPG/PNG
- [ ] Video demo (optional but recommended)
- [ ] Permissions justification video

#### Apple App Store Only
- [ ] Multiple screenshot sizes for all devices
- [ ] Promo text (170 chars, optional)
- [ ] App preview video (optional)

---

## 📱 Google Play Store

### Setup (One-Time)
- [ ] Pay $25 developer registration fee
- [ ] Create Google Play Console account
- [ ] Verify identity

### Signing & Building
- [ ] Generate release keystore: `keytool -genkey -v -keystore release-key.jks ...`
- [ ] Backup keystore file securely (CRITICAL!)
- [ ] Configure signing in gradle.properties (local only, don't commit)
- [ ] Build release bundle: `.\gradlew.bat bundleRelease`
- [ ] Verify signing: `keytool -list -v -keystore release-key.jks`

### Google Play Console
- [ ] Create new app entry
- [ ] Fill out store listing
- [ ] Upload app icon & feature graphic
- [ ] Upload screenshots
- [ ] Add short & full description
- [ ] Set content rating
- [ ] Complete data safety section
- [ ] Add privacy policy URL
- [ ] Justify permissions (RECORD_AUDIO, ACCESSIBILITY, OVERLAY)
- [ ] Upload AAB file (app-release.aab)
- [ ] Write release notes
- [ ] Submit for review

---

## 🍎 Apple App Store (iOS)

### Setup (One-Time)
- [ ] Enroll in Apple Developer Program ($99/year)
- [ ] Create App Store Connect account
- [ ] Add iOS platform: `npx cap add ios`

### Xcode Configuration
- [ ] Open project: `npx cap open ios`
- [ ] Set bundle identifier: com.lovable.routinevoicepilot
- [ ] Add all required app icons
- [ ] Configure signing & capabilities
- [ ] Add privacy usage descriptions in Info.plist:
  - [ ] NSMicrophoneUsageDescription
  - [ ] NSSpeechRecognitionUsageDescription

### App Store Connect
- [ ] Create new app
- [ ] Upload screenshots for all device sizes
- [ ] Add app description
- [ ] Set keywords
- [ ] Add support & privacy policy URLs
- [ ] Archive in Xcode: Product → Archive
- [ ] Upload to App Store
- [ ] Submit for review

---

## 🧪 Testing

### Before Release
- [ ] Test on Android API 23+ (minimum supported)
- [ ] Test on different screen sizes
- [ ] Test all voice commands
- [ ] Test microphone permission flow
- [ ] Test accessibility service setup
- [ ] Test notifications
- [ ] Test on low-end devices

### Beta Testing
- [ ] Google Play Internal Testing track
- [ ] TestFlight for iOS
- [ ] Collect feedback from beta testers
- [ ] Fix any reported issues

---

## 📊 Post-Submission

### Monitor
- [ ] Track review status daily
- [ ] Respond to reviewer questions promptly
- [ ] Monitor crash reports
- [ ] Read user reviews
- [ ] Respond to user feedback

### After Approval
- [ ] Announce launch
- [ ] Share store links
- [ ] Monitor analytics
- [ ] Plan first update/patch

---

## 🔧 Quick Commands

```powershell
# Build release bundle (Google Play)
cd android
.\gradlew.bat bundleRelease

# Build release APK
.\gradlew.bat assembleRelease

# Install release on device
adb install -r app/build/outputs/apk/release/app-release.apk

# Check signing
keytool -list -v -keystore release-key.jks

# iOS build
npx cap sync ios
npx cap open ios
# Then: Product → Archive in Xcode
```

---

## 📋 Store URLs (After Publishing)

- **Google Play**: https://play.google.com/store/apps/details?id=com.lovable.routinevoicepilot
- **Apple App Store**: https://apps.apple.com/app/routine-voice-pilot/id[APP_ID]

---

## ⚠️ IMPORTANT NOTES

1. **Never lose your release keystore** - back it up in multiple secure locations
2. **Keep credentials secure** - don't commit signing configs to git
3. **Test thoroughly** - rejection delays by weeks
4. **Privacy policy required** - both stores mandate it
5. **Version increments** - Always increment versionCode for each release
6. **Review times** - Google: hours to days, Apple: 1-3 days typically

---

**Last Updated**: 2025-12-01
