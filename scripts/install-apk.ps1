<#
.SYNOPSIS
    Install SpeakEasy Voice Control APK on Android device

.DESCRIPTION
    Automatically detects connected Android devices and installs the debug APK.
    Requires ADB (Android Debug Bridge) in PATH or Android Studio installed.

.PARAMETER ApkPath
    Path to the APK file (defaults to latest debug build)

.PARAMETER Reinstall
    Uninstall existing app before installing (clean install)

.EXAMPLE
    .\scripts\install-apk.ps1
    Install the debug APK on connected device

.EXAMPLE
    .\scripts\install-apk.ps1 -Reinstall
    Clean install (removes existing app first)
#>

param(
    [Parameter()]
    [string]$ApkPath = "",

    [Parameter()]
    [switch]$Reinstall
)

$ErrorActionPreference = "Stop"

# Color output helpers
function Write-Step {
    param([string]$Message)
    Write-Host "`n➜ $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

function Write-Info {
    param([string]$Message)
    Write-Host "  $Message" -ForegroundColor Gray
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠ $Message" -ForegroundColor Yellow
}

# Get script directory and project root
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host " SpeakEasy Voice Control - APK Installer" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan

# Find APK if not specified
if ([string]::IsNullOrEmpty($ApkPath)) {
    $ApkPath = Join-Path $ProjectRoot "android\app\build\outputs\apk\debug\app-debug.apk"
}

# Check if APK exists
if (-not (Test-Path $ApkPath)) {
    Write-Error "APK not found at: $ApkPath"
    Write-Info "Run 'npm run build' and './android/gradlew assembleDebug' first"
    exit 1
}

$apkInfo = Get-Item $ApkPath
Write-Success "Found APK:"
Write-Host "  Location: " -NoNewline -ForegroundColor Gray
Write-Host $apkInfo.FullName -ForegroundColor White
Write-Host "  Size:     " -NoNewline -ForegroundColor Gray
Write-Host "$([math]::Round($apkInfo.Length/1MB, 2)) MB" -ForegroundColor White
Write-Host "  Modified: " -NoNewline -ForegroundColor Gray
Write-Host $apkInfo.LastWriteTime -ForegroundColor White

# Check for ADB
Write-Step "Checking for ADB (Android Debug Bridge)..."
$adbPath = $null

try {
    $adbPath = (Get-Command adb -ErrorAction SilentlyContinue).Source
    Write-Success "ADB found: $adbPath"
} catch {
    # Try Android SDK locations
    $possiblePaths = @(
        "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe",
        "$env:ANDROID_HOME\platform-tools\adb.exe",
        "C:\Program Files (x86)\Android\android-sdk\platform-tools\adb.exe",
        "C:\Android\Sdk\platform-tools\adb.exe"
    )

    foreach ($path in $possiblePaths) {
        if (Test-Path $path) {
            $adbPath = $path
            Write-Success "ADB found: $adbPath"
            break
        }
    }
}

if (-not $adbPath) {
    Write-Error "ADB not found!"
    Write-Host ""
    Write-Warning "To install ADB:"
    Write-Info "1. Install Android Studio: https://developer.android.com/studio"
    Write-Info "2. Or download SDK Platform Tools: https://developer.android.com/tools/releases/platform-tools"
    Write-Info "3. Add to PATH or set ANDROID_HOME environment variable"
    Write-Host ""
    Write-Warning "Alternative: Copy APK to your phone manually:"
    Write-Info "1. Copy: $ApkPath"
    Write-Info "2. To your Android device"
    Write-Info "3. Open the file and install"
    Write-Host ""
    Read-Host "Press Enter to open APK folder"
    Start-Process explorer.exe -ArgumentList "/select,`"$ApkPath`""
    exit 1
}

# Check for connected devices
Write-Step "Checking for connected devices..."
$devices = & $adbPath devices | Select-String -Pattern "\t(device|unauthorized|offline)" | ForEach-Object { $_.ToString() }

if ($devices.Count -eq 0) {
    Write-Error "No Android devices detected!"
    Write-Host ""
    Write-Warning "To connect your device:"
    Write-Info "1. Enable Developer Options on your Android device"
    Write-Info "   (Settings → About Phone → Tap 'Build Number' 7 times)"
    Write-Info "2. Enable USB Debugging"
    Write-Info "   (Settings → Developer Options → USB Debugging)"
    Write-Info "3. Connect device via USB cable"
    Write-Info "4. Allow USB debugging when prompted on device"
    Write-Host ""
    Write-Info "Or use wireless ADB (Android 11+):"
    Write-Info "1. Settings → Developer Options → Wireless Debugging"
    Write-Info "2. Pair device with pairing code"
    Write-Info "3. Run: adb connect <IP>:<PORT>"
    Write-Host ""
    exit 1
}

Write-Success "Found $($devices.Count) device(s):"
$devices | ForEach-Object { Write-Info $_ }

# Check for unauthorized devices
$unauthorized = $devices | Where-Object { $_ -match "unauthorized" }
if ($unauthorized) {
    Write-Warning "Some devices are unauthorized!"
    Write-Info "Check your phone and allow USB debugging"
    exit 1
}

# Get package name from APK
$packageName = "com.lovable.routinevoicepilot"

# Uninstall if requested
if ($Reinstall) {
    Write-Step "Uninstalling existing app..."
    try {
        & $adbPath uninstall $packageName 2>&1 | Out-Null
        Write-Success "Existing app removed"
    } catch {
        Write-Info "No existing app found (first install)"
    }
}

# Install APK
Write-Step "Installing APK..."
try {
    $output = & $adbPath install -r $ApkPath 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Success "APK installed successfully!"
    } else {
        Write-Error "Installation failed: $output"
        exit 1
    }
} catch {
    Write-Error "Installation failed: $_"
    exit 1
}

# Launch app
Write-Step "Do you want to launch the app now? (Y/n)"
$response = Read-Host
if ($response -eq "" -or $response -eq "Y" -or $response -eq "y") {
    Write-Step "Launching app..."
    & $adbPath shell am start -n "$packageName/.MainActivity" 2>&1 | Out-Null
    Write-Success "App launched!"
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
Write-Success "Installation complete!"
Write-Host ""
Write-Info "App permissions you may need to grant:"
Write-Info "  • Microphone (for voice commands)"
Write-Info "  • Camera (for photo features)"
Write-Info "  • Location (for geolocation features)"
Write-Info "  • Notifications (for alerts)"
Write-Info "  • Accessibility Service (for system control)"
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
