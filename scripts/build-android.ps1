<#
.SYNOPSIS
    Build script for SpeakEasy Voice Control Android app

.DESCRIPTION
    Automates the build process for the Android application, including
    web asset compilation, Capacitor sync, and APK generation.

.PARAMETER BuildType
    Type of build to create: Debug or Release (default: Debug)

.PARAMETER Clean
    Perform a clean build (removes previous build artifacts)

.PARAMETER SkipWeb
    Skip web asset building (use existing build)

.PARAMETER SkipSync
    Skip Capacitor sync (use existing sync)

.PARAMETER Lint
    Run lint checks before building

.PARAMETER Test
    Run unit tests after building

.EXAMPLE
    .\scripts\build-android.ps1
    Build debug APK with default options

.EXAMPLE
    .\scripts\build-android.ps1 -BuildType Release -Clean
    Clean build of release APK

.EXAMPLE
    .\scripts\build-android.ps1 -Lint -Test
    Build with lint checks and tests
#>

param(
    [Parameter()]
    [ValidateSet('Debug', 'Release')]
    [string]$BuildType = 'Debug',

    [Parameter()]
    [switch]$Clean,

    [Parameter()]
    [switch]$SkipWeb,

    [Parameter()]
    [switch]$SkipSync,

    [Parameter()]
    [switch]$Lint,

    [Parameter()]
    [switch]$Test
)

$ErrorActionPreference = "Stop"
$ProgressPreference = 'SilentlyContinue'

# Color output helpers
function Write-Step {
    param([string]$Message)
    Write-Host "➜ $Message" -ForegroundColor Cyan
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

# Get script directory and project root
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host " SpeakEasy Voice Control - Android Build Script" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Check prerequisites
Write-Step "Checking prerequisites..."

# Check Java version
try {
    $javaVersion = & java -version 2>&1 | Select-String "version" | ForEach-Object { $_ -replace '.*version "(\d+).*', '$1' }
    if ($javaVersion -ne "21") {
        Write-Error "Java 21 is required (found: Java $javaVersion)"
        Write-Info "Download from: https://adoptium.net/"
        exit 1
    }
    Write-Success "Java 21 detected"
} catch {
    Write-Error "Java not found in PATH"
    exit 1
}

# Check Node.js
try {
    $nodeVersion = & node --version
    Write-Success "Node.js detected: $nodeVersion"
} catch {
    Write-Error "Node.js not found in PATH"
    exit 1
}

# Change to project root
Set-Location $ProjectRoot

# Install npm dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-Step "Installing npm dependencies..."
    npm ci
    if ($LASTEXITCODE -ne 0) {
        Write-Error "npm install failed"
        exit 1
    }
    Write-Success "Dependencies installed"
}

# Build web assets
if (-not $SkipWeb) {
    Write-Step "Building web assets..."
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Web build failed"
        exit 1
    }
    Write-Success "Web assets built"
} else {
    Write-Info "Skipping web build"
}

# Sync Capacitor
if (-not $SkipSync) {
    Write-Step "Syncing Capacitor..."
    npx cap sync android
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Capacitor sync failed"
        exit 1
    }
    Write-Success "Capacitor synced"
} else {
    Write-Info "Skipping Capacitor sync"
}

# Change to android directory
Set-Location "$ProjectRoot\android"

# Clean build if requested
if ($Clean) {
    Write-Step "Cleaning previous build..."
    .\gradlew.bat clean
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Clean failed"
        exit 1
    }
    Write-Success "Clean completed"
}

# Run lint if requested
if ($Lint) {
    Write-Step "Running lint checks..."
    .\gradlew.bat lint
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Lint checks failed"
        Write-Info "Check reports in: android\app\build\reports\lint-results-debug.html"
        exit 1
    }
    Write-Success "Lint checks passed"
}

# Build APK
Write-Step "Building $BuildType APK..."
$gradleTask = if ($BuildType -eq 'Release') { 'assembleRelease' } else { 'assembleDebug' }

.\gradlew.bat $gradleTask
if ($LASTEXITCODE -ne 0) {
    Write-Error "Build failed"
    exit 1
}
Write-Success "Build completed"

# Run tests if requested
if ($Test) {
    Write-Step "Running unit tests..."
    .\gradlew.bat test
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Tests failed"
        exit 1
    }
    Write-Success "Tests passed"
}

# Find and display APK location
$apkDir = if ($BuildType -eq 'Release') { 'release' } else { 'debug' }
$apkPath = "app\build\outputs\apk\$apkDir\app-$($apkDir.ToLower()).apk"

if (Test-Path $apkPath) {
    $apkSize = [math]::Round((Get-Item $apkPath).Length / 1MB, 2)
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
    Write-Success "Build completed successfully!"
    Write-Host ""
    Write-Host "  APK Location: " -NoNewline -ForegroundColor Gray
    Write-Host $apkPath -ForegroundColor White
    Write-Host "  APK Size:     " -NoNewline -ForegroundColor Gray
    Write-Host "$apkSize MB" -ForegroundColor White
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
    Write-Host ""
    
    # Offer to open the folder
    Write-Host "Press Enter to open output folder, or Ctrl+C to exit" -ForegroundColor Yellow
    Read-Host
    Start-Process explorer.exe -ArgumentList "/select,`"$ProjectRoot\android\$apkPath`""
} else {
    Write-Error "APK not found at expected location: $apkPath"
    exit 1
}
