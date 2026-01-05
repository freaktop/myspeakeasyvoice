# 🚀 Android Production Deployment - Step-by-Step Commands

Complete command-by-command guide for deploying SpeakEasy to Google Play Store.

---

## 📋 Prerequisites Checklist

Before starting, ensure you have:
- [ ] Node.js 18+ installed
- [ ] Android Studio installed
- [ ] Java JDK 21 installed
- [ ] Android device or emulator for testing
- [ ] Google Play Developer account ($25 fee - can do later)

---

## 🔧 Step 1: Update App Configuration

### 1.1 Update App ID (Required)

**File**: `capacitor.config.ts`

```typescript
// Change this line:
appId: 'com.speakeasy.voiceassistant', // Change to YOUR unique ID
// Example: 'com.yourcompany.speakeasy' or 'com.yourname.speakeasy'
```

**Why**: Play Store requires a unique app ID. You cannot use `com.lovable.routinevoicepilot`.

---

## 🏗️ Step 2: Build Web App

### 2.1 Install Dependencies (if needed)

```powershell
cd "C:\Users\model\Documents\Downloads\MySpeakEasy\myspeakeasyvoice-temp"
npm install
```

### 2.2 Build Production Web App

```powershell
npm run build
```

**Expected Output**: 
- ✅ `dist/` folder created
- ✅ No build errors
- ✅ Build completes successfully

**If errors occur**: Fix them before proceeding.

---

## 📱 Step 3: Sync to Android

### 3.1 Sync Web Assets to Android Project

```powershell
npx cap sync android
```

**Expected Output**:
```
✔ Copying web assets from dist to android/app/src/main/assets/public
✔ Copying native bridge
✔ Copying capacitor.config.json
✔ Syncing Android project
```

**What this does**: Copies your built web app (`dist/`) into the Android project.

---

## 🔐 Step 4: Set Up Release Signing (CRITICAL)

**⚠️ IMPORTANT**: You MUST do this before building for Play Store. Without signing, you cannot update your app later.

### 4.1 Navigate to Android Folder

```powershell
cd android
```

### 4.2 Generate Release Keystore

```powershell
keytool -genkey -v -keystore release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias release-key
```

**You'll be prompted for**:
- **Keystore password**: (Remember this! Write it down securely)
- **Re-enter password**: (Same password)
- **Key password**: (Can be same as keystore password, or different)
- **First and last name**: Your name or company name
- **Organizational unit**: (Optional, press Enter)
- **Organization**: Your company name
- **City**: Your city
- **State**: Your state/province
- **Country code**: Two-letter code (e.g., US, UK, CA)

**Example**:
```
Enter keystore password: MySecurePassword123!
Re-enter password: MySecurePassword123!
What is your first and last name?
  [Unknown]:  John Doe
What is the name of your organizational unit?
  [Unknown]:  Development
What is the name of your organization?
  [Unknown]:  My Company Inc
What is the name of your City or Locality?
  [Unknown]:  New York
What is the name of your State or Province?
  [Unknown]:  New York
What is the two-letter country code for this unit?
  [Unknown]:  US
```

**Expected Output**:
```
Generating 2,048 bit RSA key pair and self-signed certificate (SHA256withRSA) with a validity of 10,000 days
        for: CN=John Doe, OU=Development, O=My Company Inc, L=New York, ST=New York, C=US
[Storing release-key.jks]
```

### 4.3 Backup Your Keystore (CRITICAL!)

```powershell
# Copy keystore to a secure backup location
Copy-Item release-key.jks "C:\Users\model\Documents\SecureBackup\release-key.jks"
# Or use your preferred backup method (cloud storage, USB drive, etc.)
```

**⚠️ WARNING**: If you lose this file, you CANNOT update your app on Play Store. Back it up in multiple secure locations!

### 4.4 Create Signing Configuration

Create a file: `android/gradle.properties` (local file, DO NOT commit to git)

```powershell
# In android folder, create gradle.properties
New-Item -Path "gradle.properties" -ItemType File
```

**Add these lines** (replace with YOUR actual values):

```properties
RELEASE_STORE_FILE=release-key.jks
RELEASE_STORE_PASSWORD=MySecurePassword123!
RELEASE_KEY_ALIAS=release-key
RELEASE_KEY_PASSWORD=MySecurePassword123!
```

**Or use environment variables** (more secure):

```powershell
# Set environment variables (Windows PowerShell)
$env:RELEASE_STORE_FILE="release-key.jks"
$env:RELEASE_STORE_PASSWORD="MySecurePassword123!"
$env:RELEASE_KEY_ALIAS="release-key"
$env:RELEASE_KEY_PASSWORD="MySecurePassword123!"
```

### 4.5 Add to .gitignore (IMPORTANT!)

```powershell
cd ..
# Add to .gitignore to prevent committing secrets
Add-Content .gitignore "`nandroid/gradle.properties`nandroid/release-key.jks"
```

---

## 🏗️ Step 5: Build Release AAB (Android App Bundle)

### 5.1 Navigate to Android Folder

```powershell
cd android
```

### 5.2 Build Release AAB (For Play Store)

```powershell
.\gradlew.bat bundleRelease
```

**Expected Output**:
```
> Task :app:bundleRelease
BUILD SUCCESSFUL in 2m 30s

BUILD SUCCESSFUL in 2m 30s
```

**Output Location**: 
```
android/app/build/outputs/bundle/release/app-release.aab
```

**This is the file you'll upload to Play Store!**

### 5.3 (Optional) Build Release APK (For Direct Installation)

```powershell
.\gradlew.bat assembleRelease
```

**Output Location**: 
```
android/app/build/outputs/apk/release/app-release.apk
```

**Use this for**: Testing on devices without Play Store, or distributing outside Play Store.

---

## 🧪 Step 6: Test Release Build

### 6.1 Install APK on Device (For Testing)

**Option A: Via USB (ADB)**

```powershell
# Connect device via USB, enable USB debugging
adb devices  # Verify device is connected

# Install release APK
adb install -r app/build/outputs/apk/release/app-release.apk
```

**Option B: Transfer APK to Device**

1. Copy `app-release.apk` to your device
2. On device: Settings → Security → Enable "Install from Unknown Sources"
3. Open APK file on device and install

### 6.2 Test on Device

- [ ] App installs successfully
- [ ] App opens without crashes
- [ ] Microphone permission prompts correctly
- [ ] Voice commands work
- [ ] All features function properly
- [ ] No console errors (check via `adb logcat`)

**If issues found**: Fix them, rebuild, and test again.

---

## 📊 Step 7: Verify Build Information

### 7.1 Check AAB File

```powershell
# Verify AAB was created
Test-Path "app/build/outputs/bundle/release/app-release.aab"
# Should return: True
```

### 7.2 Check Version Info

**File**: `android/app/build.gradle`

Verify these values:
```gradle
versionCode 2        // Increment for each release
versionName "1.1.0"  // Semantic versioning
```

**For next release**: Increment both:
- `versionCode 2` → `versionCode 3`
- `versionName "1.1.0"` → `versionName "1.2.0"`

### 7.3 Verify Signing

```powershell
# Check if AAB is signed
keytool -list -v -keystore release-key.jks
# Enter keystore password when prompted
```

**Expected Output**: Shows certificate information, including your name/organization.

---

## 🏪 Step 8: Prepare for Play Store Submission

### 8.1 Create Google Play Developer Account

1. Go to [Google Play Console](https://play.google.com/console)
2. Sign in with Google account
3. Pay $25 one-time registration fee
4. Complete identity verification (may take 1-2 days)

### 8.2 Create New App

1. In Play Console, click **"Create app"**
2. Fill in:
   - **App name**: "SpeakEasy Voice Control"
   - **Default language**: English (United States)
   - **App or game**: App
   - **Free or paid**: Free (or Paid)
   - **Declarations**: Accept terms

### 8.3 Upload AAB File

1. Go to **Production** → **Create new release**
2. Click **"Upload"**
3. Select: `android/app/build/outputs/bundle/release/app-release.aab`
4. Wait for upload to complete
5. Add **Release notes** (what's new in this version)
6. Click **"Save"**

### 8.4 Complete Store Listing

**Required Fields**:
- [ ] **App icon** (512x512 PNG, no transparency)
- [ ] **Feature graphic** (1024x500 JPG/PNG)
- [ ] **Screenshots** (minimum 2, recommended 4-8)
- [ ] **Short description** (80 characters max)
- [ ] **Full description** (4000 characters max)
- [ ] **Privacy policy URL** (REQUIRED - must be publicly accessible)

**Optional but Recommended**:
- [ ] Promo video
- [ ] App category: Productivity or Tools
- [ ] Tags/keywords

### 8.5 Complete App Content

1. **Privacy Policy**: Add URL to hosted privacy policy
2. **Data Safety**: Fill out data collection form
   - Declare: Voice recordings (if stored)
   - Purpose: App functionality
   - Data sharing: No (unless you share data)
3. **Content Rating**: Complete questionnaire
4. **Target Audience**: Select age groups

### 8.6 Submit for Review

1. Review all sections (green checkmarks)
2. Click **"Start rollout to Production"**
3. Confirm submission
4. Wait for review (typically 1-3 days)

---

## 🔄 Step 9: Update Process (For Future Releases)

When you need to update your app:

### 9.1 Update Version

**File**: `android/app/build.gradle`

```gradle
versionCode 3        // Increment by 1
versionName "1.2.0"  // Update version
```

### 9.2 Rebuild

```powershell
# Build web app
cd ..
npm run build

# Sync to Android
npx cap sync android

# Build release AAB
cd android
.\gradlew.bat bundleRelease
```

### 9.3 Upload New Release

1. Go to Play Console → Your App → Production
2. Click **"Create new release"**
3. Upload new AAB file
4. Add release notes
5. Submit for review

---

## 📝 Complete Command Sequence (Copy-Paste Ready)

### First-Time Setup

```powershell
# 1. Navigate to project
cd "C:\Users\model\Documents\Downloads\MySpeakEasy\myspeakeasyvoice-temp"

# 2. Build web app
npm run build

# 3. Sync to Android
npx cap sync android

# 4. Navigate to Android folder
cd android

# 5. Generate keystore (follow prompts)
keytool -genkey -v -keystore release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias release-key

# 6. Create gradle.properties (edit with your values)
# Create file and add signing config (see Step 4.4)

# 7. Build release AAB
.\gradlew.bat bundleRelease

# 8. Verify AAB created
Test-Path "app/build/outputs/bundle/release/app-release.aab"
```

### For Updates (After First Release)

```powershell
# 1. Update version in android/app/build.gradle
# versionCode 2 → 3
# versionName "1.1.0" → "1.2.0"

# 2. Build web app
cd "C:\Users\model\Documents\Downloads\MySpeakEasy\myspeakeasyvoice-temp"
npm run build

# 3. Sync to Android
npx cap sync android

# 4. Build release AAB
cd android
.\gradlew.bat bundleRelease

# 5. Upload new AAB to Play Console
```

---

## ⚠️ Common Issues & Solutions

### Issue: "Keystore file not found"

**Solution**: Make sure `release-key.jks` is in the `android/` folder, or update `RELEASE_STORE_FILE` path in `gradle.properties`.

### Issue: "Signing config not found"

**Solution**: Create `gradle.properties` in `android/` folder with signing credentials.

### Issue: "Build failed"

**Solution**: 
```powershell
# Clean and rebuild
.\gradlew.bat clean
.\gradlew.bat bundleRelease
```

### Issue: "AAB file too large"

**Solution**: Enable ProGuard/R8 minification in `build.gradle`:
```gradle
buildTypes {
    release {
        minifyEnabled true
        shrinkResources true
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
}
```

### Issue: "App crashes on device"

**Solution**: 
1. Check logs: `adb logcat`
2. Test debug build first: `.\gradlew.bat assembleDebug`
3. Verify all permissions are granted
4. Check for missing environment variables

---

## ✅ Final Checklist Before Submission

- [ ] App ID updated to unique identifier
- [ ] Release keystore generated and backed up
- [ ] Signing configured in `gradle.properties`
- [ ] Release AAB built successfully
- [ ] Tested on real Android device
- [ ] No crashes or critical bugs
- [ ] App icons added (all sizes)
- [ ] Screenshots taken (minimum 2)
- [ ] Privacy policy hosted online
- [ ] Store listing content written
- [ ] Google Play Developer account created
- [ ] AAB uploaded to Play Console
- [ ] All required fields completed
- [ ] Submitted for review

---

## 📚 Additional Resources

- [Native App Guide](./NATIVE_APP_GUIDE.md) - Detailed conversion guide
- [Play Store Readiness](./PLAY_STORE_READINESS.md) - Production assessment
- [Store Submission Guide](./STORE_SUBMISSION_GUIDE.md) - Play Store setup
- [Capacitor Android Docs](https://capacitorjs.com/docs/android)
- [Google Play Console](https://play.google.com/console)

---

## 🎯 Quick Reference

| Task | Command |
|------|---------|
| Build web app | `npm run build` |
| Sync to Android | `npx cap sync android` |
| Generate keystore | `keytool -genkey -v -keystore release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias release-key` |
| Build release AAB | `cd android && .\gradlew.bat bundleRelease` |
| Build release APK | `cd android && .\gradlew.bat assembleRelease` |
| Install APK | `adb install -r app/build/outputs/apk/release/app-release.apk` |
| Check signing | `keytool -list -v -keystore release-key.jks` |

---

**Last Updated**: 2025-01-XX  
**Status**: Production Ready ✅

