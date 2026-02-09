# Android Device Testing Script
# Comprehensive tests for Android features

param(
    [switch]$BuildAndInstall,
    [switch]$PerformanceTest,
    [switch]$LogsOnly
)

Write-Host "📱 Android Device Testing Suite" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if ADB is available
try {
    $adbVersion = adb version 2>&1
    Write-Host "✓ ADB found: $($adbVersion[0])" -ForegroundColor Green
} catch {
    Write-Host "✗ ADB not found. Install Android SDK Platform Tools" -ForegroundColor Red
    exit 1
}

# Check if device is connected
Write-Host ""
Write-Host "Checking for connected devices..." -ForegroundColor Yellow
$devices = adb devices | Select-String "device$"
if ($devices.Count -eq 0) {
    Write-Host "✗ No Android devices detected" -ForegroundColor Red
    Write-Host "  Connect a device via USB or start an emulator" -ForegroundColor Gray
    exit 1
} else {
    Write-Host "✓ Found $($devices.Count) device(s)" -ForegroundColor Green
}

Write-Host ""

# If LogsOnly flag is set, just show logs
if ($LogsOnly) {
    Write-Host "📜 Showing live logs (Ctrl+C to stop)..." -ForegroundColor Cyan
    Write-Host ""
    adb logcat | Select-String -Pattern "SpeakEasy|routinevoicepilot|AndroidRuntime"
    exit 0
}

# Build and install if requested
if ($BuildAndInstall) {
    Write-Host "🔨 Building Android APK..." -ForegroundColor Yellow
    Push-Location android
    
    try {
        .\gradlew.bat assembleDebug
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Build successful" -ForegroundColor Green
        } else {
            Write-Host "✗ Build failed" -ForegroundColor Red
            Pop-Location
            exit 1
        }
    } catch {
        Write-Host "✗ Build error: $_" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    
    Pop-Location
    
    Write-Host ""
    Write-Host "📲 Installing APK on device..." -ForegroundColor Yellow
    
    $apkPath = "android\app\build\outputs\apk\debug\app-debug.apk"
    if (Test-Path $apkPath) {
        try {
            adb install -r $apkPath
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✓ Installation successful" -ForegroundColor Green
            } else {
                Write-Host "✗ Installation failed" -ForegroundColor Red
                exit 1
            }
        } catch {
            Write-Host "✗ Install error: $_" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "✗ APK not found at $apkPath" -ForegroundColor Red
        exit 1
    }
    
    Write-Host ""
    Write-Host "🚀 Launching app..." -ForegroundColor Yellow
    adb shell am start -n com.lovable.routinevoicepilot/.MainActivity
    Start-Sleep -Seconds 2
}

Write-Host ""
Write-Host "🧪 Running Device Tests..." -ForegroundColor Cyan
Write-Host "===========================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Check if app is installed
Write-Host "Test 1: App Installation" -ForegroundColor Yellow
$appInstalled = adb shell pm list packages | Select-String "com.lovable.routinevoicepilot"
if ($appInstalled) {
    Write-Host "  ✓ App is installed" -ForegroundColor Green
} else {
    Write-Host "  ✗ App not installed" -ForegroundColor Red
    Write-Host "    Run with -BuildAndInstall flag to build and install" -ForegroundColor Gray
    exit 1
}

# Test 2: Check app version
Write-Host ""
Write-Host "Test 2: App Version" -ForegroundColor Yellow
try {
    $versionCode = adb shell dumpsys package com.lovable.routinevoicepilot | Select-String "versionCode"
    if ($versionCode) {
        Write-Host "  ✓ $($versionCode[0].ToString().Trim())" -ForegroundColor Green
    }
} catch {
    Write-Host "  ⚠ Could not retrieve version" -ForegroundColor Yellow
}

# Test 3: Check permissions
Write-Host ""
Write-Host "Test 3: Permissions Status" -ForegroundColor Yellow
$permissions = @(
    "android.permission.RECORD_AUDIO",
    "android.permission.INTERNET",
    "android.permission.ACCESS_NETWORK_STATE"
)

foreach ($perm in $permissions) {
    $permStatus = adb shell dumpsys package com.lovable.routinevoicepilot | Select-String $perm
    if ($permStatus) {
        $granted = $permStatus -match "granted=true"
        if ($granted) {
            Write-Host "  ✓ $perm granted" -ForegroundColor Green
        } else {
            Write-Host "  ⚠ $perm not granted (may need manual approval)" -ForegroundColor Yellow
        }
    }
}

# Performance tests if requested
if ($PerformanceTest) {
    Write-Host ""
    Write-Host "⚡ Performance Tests" -ForegroundColor Yellow
    Write-Host "===================" -ForegroundColor Yellow
    
    # Memory usage
    Write-Host ""
    Write-Host "Memory Usage:" -ForegroundColor Cyan
    $memInfo = adb shell dumpsys meminfo com.lovable.routinevoicepilot | Select-String "TOTAL"
    if ($memInfo) {
        Write-Host "  $($memInfo[0].ToString().Trim())" -ForegroundColor White
    }
    
    # CPU usage (requires app to be running)
    Write-Host ""
    Write-Host "CPU Usage (5 second sample):" -ForegroundColor Cyan
    Write-Host "  Sampling..." -ForegroundColor Gray
    $cpuBefore = adb shell dumpsys cpuinfo | Select-String "routinevoicepilot" | Select-Object -First 1
    Start-Sleep -Seconds 5
    $cpuAfter = adb shell dumpsys cpuinfo | Select-String "routinevoicepilot" | Select-Object -First 1
    if ($cpuAfter) {
        Write-Host "  $($cpuAfter.ToString().Trim())" -ForegroundColor White
    } else {
        Write-Host "  ⚠ App may not be running" -ForegroundColor Yellow
    }
    
    # Battery stats
    Write-Host ""
    Write-Host "Battery Impact:" -ForegroundColor Cyan
    $batteryStats = adb shell dumpsys batterystats | Select-String "routinevoicepilot" | Select-Object -First 3
    if ($batteryStats) {
        $batteryStats | ForEach-Object { Write-Host "  $($_.ToString().Trim())" -ForegroundColor White }
    }
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "✅ Device tests complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Manual Testing Checklist:" -ForegroundColor Cyan
Write-Host "1. Open the app on your device" -ForegroundColor White
Write-Host "2. Grant microphone permission" -ForegroundColor White
Write-Host "3. Try saying 'Hey SpeakEasy'" -ForegroundColor White
Write-Host "4. Test voice commands from TESTING_PLAN.md" -ForegroundColor White
Write-Host "5. Check background listening works" -ForegroundColor White
Write-Host "6. Enable Accessibility Service for system commands" -ForegroundColor White
Write-Host ""
Write-Host "To view live logs, run:" -ForegroundColor Yellow
Write-Host "  .\scripts\test-android-device.ps1 -LogsOnly" -ForegroundColor Gray
Write-Host ""
