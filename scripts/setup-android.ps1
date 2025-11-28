# PowerShell helper: Prepare Android native project
# Usage: Run this in project root in PowerShell

param()

Write-Host "Running npm ci to install node dependencies..."
npm ci

Write-Host "Syncing Capacitor native project (android)..."
npx cap sync android

Write-Host "Optional: configure JAVA_HOME to point to JDK 21 before running Gradle builds."
Write-Host "Then run: .\android\gradlew.bat assembleDebug --no-daemon --stacktrace --info"
Write-Host "\nChecking Java version..."
try {
	$v = & java -version 2>&1 | Out-String
	if ($v -match 'version "21') {
		Write-Host "Detected JDK 21. Good to build."
	} else {
		Write-Host "WARNING: System Java is not 21. Your builds may use a toolchain or fail. Consider installing JDK 21 and setting JAVA_HOME."
		Write-Host "Use scripts/install-jdk21.ps1 to attempt to install or follow MANUAL steps in DEPLOYMENT_GUIDE.md"
	}
} catch {
	Write-Host "Unable to check Java version - ensure JDK 21 is installed and JAVA_HOME is set.";
}
