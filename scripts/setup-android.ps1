# PowerShell helper: Prepare Android native project
# Usage: Run this in project root in PowerShell

param()

Write-Host "Running npm ci to install node dependencies..."
npm ci

Write-Host "Syncing Capacitor native project (android)..."
npx cap sync android

Write-Host "Optional: configure JAVA_HOME to point to JDK 21 before running Gradle builds."
Write-Host "Then run: .\android\gradlew.bat assembleDebug --no-daemon --stacktrace --info"
