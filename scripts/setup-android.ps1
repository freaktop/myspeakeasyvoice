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

# Check for Gradle wrapper & gradle.properties auto-download
if (Test-Path "android\gradlew.bat") {
	Write-Host "Gradle wrapper found: printing wrapper information..."
	try {
		& .\android\gradlew.bat -v
	} catch {
		Write-Host "Unable to run gradlew -v. Gradle wrapper might need to be updated or the wrapper download failed. See scripts/upgrade-gradle-wrapper.ps1"
	}

	# Check gradle.properties for toolchain auto-download
	if (Test-Path "android\gradle.properties") {
		$gp = Get-Content "android\gradle.properties" | Out-String
		if ($gp -notmatch 'org.gradle.java.installations.auto-download=true') {
			Write-Host "Consider enabling 'org.gradle.java.installations.auto-download=true' in android/gradle.properties to allow Gradle toolchain auto-downloads."
		} else {
			Write-Host "Gradle toolchain auto-download is enabled in android/gradle.properties."
		}
	}
} else {
	Write-Host "No Gradle wrapper found in android/ directory. Ensure you have a valid Android platform by running: npx cap add android or npx cap sync android"
}
