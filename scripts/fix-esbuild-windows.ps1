# Fix esbuild platform mismatch on Windows
# Usage from project root:
#   powershell -ExecutionPolicy Bypass -File .\scripts\fix-esbuild-windows.ps1

$ErrorActionPreference = 'SilentlyContinue'

# Clean previous build and lock files
if (Test-Path -Path './dist') { Remove-Item -Recurse -Force './dist' }
if (Test-Path -Path './node_modules') { Remove-Item -Recurse -Force './node_modules' }
if (Test-Path -Path './package-lock.json') { Remove-Item -Force './package-lock.json' }
if (Test-Path -Path './bun.lockb') { Remove-Item -Force './bun.lockb' }

$ErrorActionPreference = 'Stop'

# Fresh install and rebuild esbuild for this platform
npm cache clean --force
npm install
npm rebuild esbuild --force

# Build the project
npm run build

if ($LASTEXITCODE -eq 0) {
  Write-Host "\n✅ Build succeeded. If you're targeting mobile, run: npx cap sync" -ForegroundColor Green
} else {
  Write-Host "\n❌ Build failed. Please copy the error shown above and share it here." -ForegroundColor Red
}
