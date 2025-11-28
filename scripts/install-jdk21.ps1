# PowerShell helper: Install JDK 21 (Temurin) using winget if available
# Usage: Run from an elevated PowerShell if necessary

param()

function Test-Java21 {
    try {
        $v = & java -version 2>&1 | Out-String
        if ($v -match 'version "21') { return $true }
    } catch { }
    return $false
}

if (Test-Java21) {
    Write-Host "Java 21 is already installed on this machine."
    java -version
    return
}

if (Get-Command winget -ErrorAction SilentlyContinue) {
    Write-Host "Detected winget. Attempting to install Eclipse Temurin JDK 21..."
    # winget package id may vary; this is the common one
    try {
        # Prefer winget for Temurin 21
        winget install --id EclipseAdoptium.Temurin.21.JDK -e --silent
    } catch {
        Write-Host "winget install failed: $_\nTrying other installers (choco, scoop) if available..."
    }
    if (!(Test-Java21)) {
        if (Get-Command choco -ErrorAction SilentlyContinue) {
            try {
                choco install temurin -y --version=21.0.0
            } catch {
                Write-Host "choco install temurin failed: $_"
            }
        }
        if (!(Test-Java21) -and (Get-Command scoop -ErrorAction SilentlyContinue)) {
            try {
                scoop install temurin
            } catch {
                Write-Host "scoop install temurin failed: $_"
            }
        }
        if (!(Test-Java21)) {
            Write-Host "All auto-install attempts failed. Please install JDK 21 manually and set JAVA_HOME."
            exit 1
        }
    }
    Write-Host "Installation command complete. Verify with java -version. You may need to restart your shell."
    java -version
    exit 0
} else {
    Write-Host "package managers (winget/choco/scoop) not available. Please install a JDK 21 distribution manually (Temurin, Oracle, Corretto, OpenJDK) and set JAVA_HOME accordingly. Example (PowerShell):"
    Write-Host "setx JAVA_HOME 'C:\\Program Files\\Eclipse Adoptium\\jdk-21'"
    Write-Host 'setx PATH "$env:JAVA_HOME\bin;$env:PATH"'
    exit 2
}
