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
    Write-Host "Gradle binary not found in PATH. Attempting to install with Chocolatey (may require admin), otherwise will try user-local download fallback."
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

    # If we couldn't install via choco, try a user-local gradle download into $env:USERPROFILE\gradle
    if (-not $gradleCmd) {
        Write-Host "Chocolatey install not available or failed. Trying user-local Gradle download fallback (no admin required)."
        $dlTargets = @(
            "https://services.gradle.org/distributions/gradle-$TargetVersion-bin.zip",
            "https://services.gradle.org/distributions/gradle-$TargetVersion-all.zip",
            "https://downloads.gradle.org/distributions/gradle-$TargetVersion-bin.zip",
            "https://downloads.gradle.org/distributions/gradle-$TargetVersion-all.zip"
        )
        $downloaded = $false
        $userGradleDir = Join-Path $env:USERPROFILE "gradle"
        $zipPath = Join-Path $env:TEMP "gradle-$TargetVersion.zip"
        foreach ($url in $dlTargets) {
            try {
                Write-Host "Trying to download Gradle from $url"
                # Ensure TLS 1.2 for older PowerShells
                [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
                Invoke-WebRequest -Uri $url -OutFile $zipPath -UseBasicParsing -TimeoutSec 120
                $downloaded = $true
                break
            } catch {
                Write-Host ([string]::Format("Download failed from {0}: {1}", $url, $_))
            }
        }
        if ($downloaded) {
            try {
                if (-Not (Test-Path -Path $userGradleDir)) { New-Item -ItemType Directory -Path $userGradleDir | Out-Null }
                Expand-Archive -Path $zipPath -DestinationPath $userGradleDir -Force
                # The zip extracts to gradle-$TargetVersion directory; find the bin path
                $installedDir = Get-ChildItem -Directory $userGradleDir | Where-Object { $_.Name -match "gradle-$TargetVersion" } | Select-Object -First 1
                if ($installedDir) {
                    $binPath = Join-Path $installedDir.FullName "bin"
                    Write-Host "Adding $binPath to PATH for this run only."
                    $env:PATH = "$binPath;$env:PATH"
                    $gradleCmd = "gradle"
                }
            } catch {
                Write-Host "Failed to extract or configure user-local Gradle: $_"
            } finally {
                if (Test-Path -Path $zipPath) { Remove-Item -Force -Path $zipPath }
            }
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
