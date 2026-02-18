# Testing & QA - Getting Started

## ✅ Current Status (2025-12-28)

### Build Status: **PASSING** ✓
- Web build: ✅ Successful
- Android setup: ✅ Complete (Java 21)
- Project structure: ✅ Valid
- Dependencies: ✅ Installed

### Known Issues to Fix:
1. **ESLint Errors (3 total):**
   - AndroidSetupGuide.tsx: Lexical declaration in case block
   - command.tsx: Empty interface
   - textarea.tsx: Empty interface

2. **ESLint Warnings (12 total):**
   - React Hook dependency warnings
   - Fast refresh component export warnings (UI components - non-critical)

---

## 🚀 Quick Start Guide

### Option 1: Web Testing (Fastest)
```powershell
# Start development server
npm run dev

# In browser, go to http://localhost:5173
# Test core voice features without Android-specific features
```

### Option 2: Android Device Testing (Full Features)
```powershell
# Prerequisites:
# 1. Connect Android device via USB with USB debugging enabled
# 2. Or start Android emulator

# Quick test
.\scripts\test-android-device.ps1 -BuildAndInstall

# Performance test
.\scripts\test-android-device.ps1 -BuildAndInstall -PerformanceTest

# View logs only
.\scripts\test-android-device.ps1 -LogsOnly
```

### Option 3: Automated Quick Tests
```powershell
# Run all quick validations
.\scripts\test-app.ps1
```

---

## 📋 Testing Workflow

### Phase 1: Fix Lint Issues (30 minutes)
**Goal:** Clean code, no errors

**Steps:**
1. Fix the 3 ESLint errors
2. Address critical dependency warnings
3. Re-run: `npm run lint`
4. Commit fixes

### Phase 2: Web Functional Testing (2-3 hours)
**Goal:** All web features work correctly

**Test Areas:**
- ✅ Authentication (signup/login/logout)
- ✅ Voice recognition initialization
- ✅ UI navigation
- ✅ Settings and profile
- ✅ Command history
- ✅ Error handling

**How to test:**
1. Run `npm run dev`
2. Open browser to http://localhost:5173
3. Follow checklist in [TESTING_PLAN.md](TESTING_PLAN.md) Section 1 & 6
4. Document issues in TESTING_PLAN.md "Critical Issues" section

### Phase 3: Android Functional Testing (4-5 hours)
**Goal:** All Android features work, especially system integration

**Test Areas:**
- ✅ App installation and launch
- ✅ Permission requests
- ✅ Voice wake phrase detection
- ✅ App launching commands
- ✅ System navigation
- ✅ Accessibility service
- ✅ Background listening
- ✅ Screen interaction

**How to test:**
1. Build and install: `.\scripts\test-android-device.ps1 -BuildAndInstall`
2. Follow checklist in [TESTING_PLAN.md](TESTING_PLAN.md) Section 1 (Android parts)
3. Test on real device (emulator may have microphone limitations)
4. Document issues

### Phase 4: Performance & Battery Testing (3-4 hours)
**Goal:** App doesn't drain battery or crash

**Test Areas:**
- ✅ Memory usage stable
- ✅ No memory leaks
- ✅ Battery drain acceptable
- ✅ App responsive
- ✅ Background performance

**How to test:**
1. Run performance test: `.\scripts\test-android-device.ps1 -BuildAndInstall -PerformanceTest`
2. Leave app running in background for 1 hour
3. Check battery usage: Settings > Battery > App usage
4. Monitor with: `npm run android:memory`
5. Follow [TESTING_PLAN.md](TESTING_PLAN.md) Section 2

### Phase 5: Device Compatibility Testing (2-3 hours)
**Goal:** Works on various devices/Android versions

**Test on:**
- Different Android versions (ideally 3+ versions)
- Different screen sizes
- Different manufacturers

**Use:**
- Physical devices if available
- Android Virtual Devices (AVD) in Android Studio
- BrowserStack/Firebase Test Lab (optional, paid)

### Phase 6: Bug Fixing & Iteration (varies)
**Goal:** All critical bugs fixed

**Process:**
1. Review all documented issues
2. Prioritize: Critical > High > Medium > Low
3. Fix critical bugs first
4. Retest after fixes
5. Repeat until stable

---

## 🎯 Minimum Requirements Before Store Submission

### Must Have (Blockers):
- [ ] **No crashes** on normal operation
- [ ] **No critical bugs** that break core features
- [ ] **Voice recognition works** reliably
- [ ] **Permissions handled** gracefully
- [ ] **Android system commands work** (app launching, navigation)
- [ ] **No lint errors** (warnings acceptable if documented)
- [ ] **Battery drain** acceptable (<10% per hour active use)
- [ ] **Memory usage** under 200MB typical

### Should Have (Important but not blocking):
- [ ] Tested on 2+ Android versions
- [ ] Tested on 2+ device sizes
- [ ] Performance optimized
- [ ] All edge cases handled
- [ ] Accessibility features work

### Nice to Have (Enhancement):
- [ ] Tested on 5+ Android versions
- [ ] Tested on 5+ devices
- [ ] Performance excellent
- [ ] UI polish
- [ ] Advanced error recovery

---

## 📊 Testing Tools & Commands Reference

### NPM Scripts
```powershell
npm run dev              # Start dev server
npm run build            # Production build
npm run lint             # Check code quality
npm run preview          # Preview production build
npm run test:build       # Lint + build
npm run test:android     # Build Android APK
npm run android:install  # Install on connected device
npm run android:logs     # View app logs
npm run android:memory   # Check memory usage
```

### PowerShell Scripts
```powershell
# Quick validation
.\scripts\test-app.ps1

# Android device testing
.\scripts\test-android-device.ps1 -BuildAndInstall
.\scripts\test-android-device.ps1 -PerformanceTest
.\scripts\test-android-device.ps1 -LogsOnly

# Android setup/building
.\scripts\build-android.ps1
.\scripts\install-apk.ps1
```

### ADB Commands
```powershell
# Device info
adb devices
adb shell getprop ro.build.version.release  # Android version

# App management
adb install -r android\app\build\outputs\apk\debug\app-debug.apk
adb uninstall com.lovable.routinevoicepilot
adb shell am start -n com.lovable.routinevoicepilot/.MainActivity

# Debugging
adb logcat | findstr "SpeakEasy"
adb logcat | findstr "AndroidRuntime"  # Crashes
adb shell dumpsys meminfo com.lovable.routinevoicepilot
adb shell dumpsys battery

# Permissions
adb shell pm grant com.lovable.routinevoicepilot android.permission.RECORD_AUDIO
```

---

## 💡 Testing Tips

### General
- **Test incrementally** - Don't try to test everything at once
- **Document as you go** - Write down issues immediately
- **Use real devices** - Emulators have limitations (microphone, sensors)
- **Test in real conditions** - Different noise levels, lighting, etc.
- **Clear data between tests** - Simulate fresh install experience

### Voice Testing
- Test in **quiet environment** first to establish baseline
- Then test with **background noise** (realistic usage)
- Try different **speaking volumes** (soft, normal, loud)
- Test **accents and speech patterns** (if possible)
- Verify **wake phrase sensitivity** is balanced

### Android Testing
- **Enable Developer Options** on device (tap Build Number 7 times)
- **Keep device awake** during testing (Developer Options > Stay Awake)
- **Monitor battery** in real-time (Settings > Battery)
- **Check logcat** for warnings even if app works
- Test with **airplane mode** to verify offline features

### Performance Testing
- Use **Android Studio Profiler** for detailed analysis
- Monitor over **extended periods** (30 min+)
- Test with **other apps** running in background
- Check **CPU, Memory, Network, Battery** together
- Look for **memory leaks** (gradually increasing usage)

---

## 🔍 Where to Find More Information

- **Comprehensive Testing Checklist:** [TESTING_PLAN.md](TESTING_PLAN.md)
- **Android Build Guide:** [ANDROID_BUILD_GUIDE.md](ANDROID_BUILD_GUIDE.md)
- **Store Submission Checklist:** [SUBMISSION_CHECKLIST.md](SUBMISSION_CHECKLIST.md)
- **App Features:** [README.md](README.md)

---

## 📝 Next Steps After Testing Complete

1. Update [SUBMISSION_CHECKLIST.md](SUBMISSION_CHECKLIST.md) with completed tests
2. Fix any remaining critical bugs
3. Prepare store assets (screenshots, descriptions)
4. Move to Phase 2: Store Submission Preparation

---

**Ready to start testing?** Run `.\scripts\test-app.ps1` now!
