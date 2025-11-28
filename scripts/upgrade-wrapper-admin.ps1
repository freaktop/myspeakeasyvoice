#!/usr/bin/env pwsh
<#
PowerShell helper: Elevation-required upgrade of Gradle wrapper using system gradle.
This runs `choco install gradle` if needed and updates the Android wrapper to the
specified version, committing wrapper files for you.

Usage (elevated PowerShell):
  pwsh -NoProfile -ExecutionPolicy Bypass -File scripts/upgrade-wrapper-admin.ps1 -Version 8.16.0

Note: Must be run from repository root; will attempt to update wrapper in `android/`.
#>

param(
    [string]$Version = "8.16.0"
)

function IsElevated {
    $currentIdentity = [System.Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object System.Security.Principal.WindowsPrincipal($currentIdentity)
    return $principal.IsInRole([System.Security.Principal.WindowsBuiltInRole]::Administrator)
}

if (-not (IsElevated)) {
    Write-Host "This script must be run in an elevated PowerShell (Run as Administrator)." -ForegroundColor Yellow
    exit 1
}

Write-Host "Ensuring gradle is installed with choco..." -ForegroundColor Cyan
if (-not (Get-Command gradle -ErrorAction SilentlyContinue)) {
    if (Get-Command choco -ErrorAction SilentlyContinue) {
        choco install gradle -y
    } else {
        Write-Host "Chocolatey not found. Please install Chocolatey or a system Gradle and re-run this script." -ForegroundColor Red
        exit 1
    }
}

Write-Host "Updating wrapper to Gradle $Version (android/)." -ForegroundColor Cyan
Push-Location android
try {
    gradle wrapper --gradle-version $Version
    Write-Host "Wrapper update command exited. Check wrapper files were updated." -ForegroundColor Green
    # Commit changes
    Pop-Location
    git add android/gradle/wrapper/*
    git commit -m "chore(build): update Gradle wrapper to $Version" || Write-Host "No wrapper changes committed" -ForegroundColor Yellow
    git push origin HEAD
} catch {
    Write-Host "Error while updating wrapper: $_" -ForegroundColor Red
    Pop-Location
    exit 2
}

Write-Host "Done. If wrapper updated, run './gradlew.bat -v' in android/ to verify." -ForegroundColor Cyan
