#!/usr/bin/env pwsh
<#
PowerShell helper: Attempt to update Gradle wrapper in android/ folder.
This script will:
  - Try to use a local gradle command if available to update wrapper
  - Otherwise, try to install gradle via Chocolatey with a warning about admin rights
  - Run `gradle wrapper --gradle-version` in android folder

Usage: Run from repository root in a PowerShell shell
#>

param(
    [string]$TargetVersion = "8.16.0"
)

function Get-GradlePath {
    try {
        $gradle = Get-Command gradle -ErrorAction SilentlyContinue
        if ($gradle) { return $gradle.Source }
    } catch { }
    return $null
}

$gradleCmd = Get-GradlePath
if (-not $gradleCmd) {
    Write-Host "Gradle binary not found in PATH. Attempting to install with Chocolatey (may require admin)."
    if (Get-Command choco -ErrorAction SilentlyContinue) {
        try {
            choco install gradle -y
            $gradleCmd = Get-GradlePath
        } catch {
            Write-Host "Chocolatey install attempt failed: $_"
        }
    } else {
        Write-Host "Chocolatey not available. Try installing Gradle manually or run this script in an elevated shell."
    }
}

if (-not $gradleCmd) {
    Write-Host "No Gradle command available. If the Gradle wrapper fails to download, you can manually install Gradle or pre-download the Gradle distribution archive into the Gradle user directory: %USERPROFILE%\.gradle\wrapper\dists\."
    Write-Host "Alternatively, run an updated Gradle wrapper on a machine with network access and then commit the updated wrapper files. See scripts/upgrade-gradle-wrapper.ps1 for a simpler wrapper command."
    exit 1
}

Write-Host "Using Gradle at: $gradleCmd"

try {
    Push-Location android
    Write-Host "Running: gradle wrapper --gradle-version $TargetVersion"
    gradle wrapper --gradle-version $TargetVersion
    Write-Host "Gradle wrapper update finished. Commit changes to the following files: gradle/wrapper/gradle-wrapper.properties, gradle/wrapper/gradle-wrapper.jar, and gradle-wrapper.properties if modified."
    Pop-Location
} catch {
    Write-Host "An error occurred while updating the Gradle wrapper: $_"
    exit 2
}
