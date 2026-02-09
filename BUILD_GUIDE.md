# Build Guide

This guide covers building the Android app locally and troubleshooting common issues.

## Prerequisites

- **Java Development Kit (JDK) 21** (LTS)
  - Download from [Eclipse Adoptium](https://adoptium.net/) or [Oracle](https://www.oracle.com/java/technologies/downloads/)
  - Set `JAVA_HOME` environment variable
- **Node.js 20+** with npm
- **Android SDK** (installed via Android Studio or standalone)
  - API Level 36 (Android 15)
  - Build Tools 36.0.0

## Quick Start

```bash
# 1. Install dependencies
npm ci

# 2. Build web assets
npm run build

# 3. Sync Capacitor
npx cap sync android

# 4. Build Android APK
cd android
./gradlew assembleDebug

# APK location: android/app/build/outputs/apk/debug/app-debug.apk
```

## Build Variants

### Debug Build
```bash
cd android
./gradlew assembleDebug
```
- No code shrinking
- Includes debug symbols
- Faster build time
- APK: `app/build/outputs/apk/debug/app-debug.apk`

### Release Build
```bash
cd android
./gradlew assembleRelease
```
- ProGuard enabled (minification & obfuscation)
- Resource shrinking enabled
- Optimized for size and performance
- Requires signing configuration
- APK: `app/build/outputs/apk/release/app-release.apk`

## Signing Configuration (Release)

Create `android/gradle.properties` (DO NOT commit) with:

```properties
RELEASE_STORE_FILE=/path/to/your/release-key.jks
RELEASE_STORE_PASSWORD=your_store_password
RELEASE_KEY_ALIAS=your_key_alias
RELEASE_KEY_PASSWORD=your_key_password
```

Or generate a debug keystore:
```bash
keytool -genkey -v -keystore android/app/debug.keystore \\
  -storepass android -alias androiddebugkey \\
  -keypass android -keyalg RSA -keysize 2048 \\
  -validity 10000 -dname "CN=Debug,O=Android,C=US"
```

## Gradle Tasks

### Common Tasks
```bash
# List all tasks
./gradlew tasks

# Clean build artifacts
./gradlew clean

# Run lint checks
./gradlew lint

# Run unit tests
./gradlew test

# Check for dependency updates
./gradlew dependencyUpdates
```

### Build Options
```bash
# Build with stack trace (for debugging)
./gradlew assembleDebug --stacktrace

# Build with detailed logs
./gradlew assembleDebug --info

# Build without using daemon (CI environments)
./gradlew assembleDebug --no-daemon

# Offline build (uses cached dependencies)
./gradlew assembleDebug --offline
```

## Performance Optimization

The project includes several optimizations in `gradle.properties`:

- ✅ **Configuration cache** - Faster subsequent builds
- ✅ **Build cache** - Reuses outputs from previous builds
- ✅ **Parallel execution** - Builds modules in parallel
- ✅ **Non-transitive R classes** - Faster compilation
- ✅ **ProGuard (release only)** - Smaller APK size

## Troubleshooting

### JDK Version Issues
```bash
# Check Java version
java -version

# Should output: openjdk version "21.x.x"
```

If wrong version:
- Windows: Set `JAVA_HOME` in System Environment Variables
- Linux/Mac: Add to `~/.bashrc` or `~/.zshrc`:
  ```bash
  export JAVA_HOME=/path/to/jdk-21
  export PATH=$JAVA_HOME/bin:$PATH
  ```

### Gradle Wrapper Issues
```bash
# Regenerate wrapper
./gradlew wrapper --gradle-version 8.13
```

### Build Failures
```bash
# Clean and rebuild
./gradlew clean
./gradlew assembleDebug --stacktrace

# Clear Gradle cache
rm -rf ~/.gradle/caches/
./gradlew clean assembleDebug
```

### Configuration Cache Errors
```bash
# Disable configuration cache temporarily
./gradlew assembleDebug --no-configuration-cache
```

### Memory Issues
Edit `android/gradle.properties`:
```properties
org.gradle.jvmargs=-Xmx6g -Dfile.encoding=UTF-8
```

## Project Structure

```
android/
├── app/                          # Main application module
│   ├── build.gradle             # App build configuration
│   ├── proguard-rules.pro       # ProGuard rules
│   └── src/                     # Source code
├── build.gradle                 # Root build configuration
├── gradle.properties            # Gradle settings & optimizations
├── gradlew                      # Gradle wrapper (Unix)
├── gradlew.bat                  # Gradle wrapper (Windows)
└── settings.gradle              # Project settings
```

## Version Information

- **Java**: 21 (LTS)
- **Kotlin**: 2.1.0
- **Android Gradle Plugin**: 8.13.2
- **Gradle**: 8.13
- **Compile SDK**: 36 (Android 15)
- **Min SDK**: 24 (Android 7.0)
- **Target SDK**: 36 (Android 15)

## CI/CD

GitHub Actions workflow automatically builds on:
- Push to `main` or `master` branches
- Pull requests
- Manual workflow dispatch

View workflow: `.github/workflows/build-android.yml`

## Additional Resources

- [Android Developer Guide](https://developer.android.com/guide)
- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Gradle Documentation](https://docs.gradle.org/)
- [ProGuard Manual](https://www.guardsquare.com/manual/home)

## Getting Help

1. Check build logs: `android/build/reports/`
2. Run with `--stacktrace` for detailed errors
3. Clear caches and rebuild
4. Check GitHub Issues for similar problems

