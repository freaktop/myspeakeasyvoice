# Quick Testing Script for SpeakEasy Voice Control
# Run this script to perform basic validation tests

Write-Host "🧪 SpeakEasy Voice Control - Quick Test Suite" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

$ErrorCount = 0
$WarningCount = 0

# Test 1: Check if required files exist
Write-Host "📁 Test 1: Checking project structure..." -ForegroundColor Yellow
$RequiredFiles = @(
    "package.json",
    "vite.config.ts",
    "android\app\build.gradle",
    "src\App.tsx",
    "src\main.tsx"
)

foreach ($file in $RequiredFiles) {
    if (Test-Path $file) {
        Write-Host "  ✓ $file exists" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $file missing!" -ForegroundColor Red
        $ErrorCount++
    }
}

Write-Host ""

# Test 2: Check npm dependencies
Write-Host "📦 Test 2: Checking npm dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "  ✓ node_modules exists" -ForegroundColor Green
} else {
    Write-Host "  ⚠ node_modules missing. Run 'npm install'" -ForegroundColor Red
    $ErrorCount++
}

Write-Host ""

# Test 3: Run linter
Write-Host "🔍 Test 3: Running ESLint..." -ForegroundColor Yellow
try {
    $lintResult = npm run lint 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ Lint passed" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ Lint warnings found (check output above)" -ForegroundColor Yellow
        $WarningCount++
    }
} catch {
    Write-Host "  ✗ Lint failed" -ForegroundColor Red
    $ErrorCount++
}

Write-Host ""

# Test 4: Check Android setup
Write-Host "📱 Test 4: Checking Android setup..." -ForegroundColor Yellow
if (Test-Path "android\gradlew.bat") {
    Write-Host "  ✓ Gradle wrapper found" -ForegroundColor Green
    
    # Check if we can find Java
    $javaHome = $env:JAVA_HOME
    if ($javaHome -and (Test-Path $javaHome)) {
        Write-Host "  ✓ JAVA_HOME set: $javaHome" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ JAVA_HOME not set or invalid" -ForegroundColor Yellow
        $WarningCount++
    }
} else {
    Write-Host "  ✗ Android setup incomplete" -ForegroundColor Red
    $ErrorCount++
}

Write-Host ""

# Test 5: Check if ADB is available
Write-Host "🔌 Test 5: Checking ADB connection..." -ForegroundColor Yellow
try {
    $adbDevices = adb devices 2>&1
    if ($adbDevices -match "device$") {
        Write-Host "  ✓ Android device connected" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ No Android device detected" -ForegroundColor Yellow
        Write-Host "    Connect a device or start an emulator to test Android features" -ForegroundColor Gray
        $WarningCount++
    }
} catch {
    Write-Host "  ⚠ ADB not found in PATH" -ForegroundColor Yellow
    Write-Host "    Install Android SDK Platform Tools to test Android features" -ForegroundColor Gray
    $WarningCount++
}

Write-Host ""

# Test 6: Try to build web version
Write-Host "🌐 Test 6: Testing web build..." -ForegroundColor Yellow
try {
    Write-Host "  Building... (this may take a moment)" -ForegroundColor Gray
    $buildResult = npm run build 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ Web build successful" -ForegroundColor Green
        if (Test-Path "dist") {
            Write-Host "  ✓ dist folder created" -ForegroundColor Green
        }
    } else {
        Write-Host "  ✗ Web build failed" -ForegroundColor Red
        Write-Host $buildResult -ForegroundColor Gray
        $ErrorCount++
    }
} catch {
    Write-Host "  ✗ Build error" -ForegroundColor Red
    $ErrorCount++
}

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "📊 Test Results Summary" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

if ($ErrorCount -eq 0 -and $WarningCount -eq 0) {
    Write-Host "✅ All tests passed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Cyan
    Write-Host "1. Run 'npm run dev' to start development server" -ForegroundColor White
    Write-Host "2. Run '.\scripts\test-app.ps1 -Android' to test Android build" -ForegroundColor White
    Write-Host "3. Check TESTING_PLAN.md for comprehensive testing checklist" -ForegroundColor White
} elseif ($ErrorCount -eq 0) {
    Write-Host "⚠️  Tests completed with $WarningCount warning(s)" -ForegroundColor Yellow
    Write-Host "Review warnings above - app may still work but some features might be limited" -ForegroundColor Yellow
} else {
    Write-Host "❌ Tests failed with $ErrorCount error(s) and $WarningCount warning(s)" -ForegroundColor Red
    Write-Host "Fix errors above before proceeding" -ForegroundColor Red
    exit 1
}

Write-Host ""
