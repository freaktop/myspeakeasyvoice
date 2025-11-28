# PowerShell helper: Install JDK 21 (Temurin) using winget if available
# Usage: Run from an elevated PowerShell if necessary

param()

function Check-Java21 {
    try {
        $v = & java -version 2>&1 | Out-String
        if ($v -match 'version "21') { return $true }
    } catch { }
    return $false
}

if (Check-Java21) {
    Write-Host "Java 21 is already installed on this machine."
    java -version
    return
}

if (Get-Command winget -ErrorAction SilentlyContinue) {
    Write-Host "Detected winget. Attempting to install Eclipse Temurin JDK 21..."
    # winget package id may vary; this is the common one
    try {
        winget install --id EclipseAdoptium.Temurin.21.JDK -e --silent
    } catch {
        Write-Host "winget install failed: $_\nPlease install a JDK 21 manually or via your package manager."
        exit 1
    }
    Write-Host "Installation command complete. Verify with java -version. You may need to restart your shell."
    java -version
    exit 0
} else {
    Write-Host "winget not available. Please install a JDK 21 distribution manually (Temurin, Oracle, Corretto, OpenJDK) and set JAVA_HOME accordingly. Example (PowerShell):"
    Write-Host "setx JAVA_HOME 'C:\\Program Files\\Eclipse Adoptium\\jdk-21'"
    Write-Host 'setx PATH "$env:JAVA_HOME\bin;$env:PATH"'
    exit 2
}
