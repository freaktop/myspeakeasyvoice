#!/usr/bin/env pwsh
<#
PowerShell helper: Install a pre-downloaded Gradle distribution zip file into the
Gradle wrapper cache so `./gradlew` can find it even when the build environment blocks
downloads. This does not require admin rights.

Usage: Run from repo root:
  pwsh -NoProfile -ExecutionPolicy Bypass -File .\scripts\install-gradle-zip.ps1 -ZipPath C:\path\to\gradle-8.16-all.zip

The script will copy the zip into `%USERPROFILE%\.gradle\wrapper\dists\gradle-8.16-all\<random>\gradle-8.16-all.zip`.
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$ZipPath
)

if (-not (Test-Path $ZipPath)) {
    Write-Host "Zip file path not found: $ZipPath" -ForegroundColor Red
    exit 1
}

$targetBase = Join-Path $env:USERPROFILE ".gradle\wrapper\dists"
if (-not (Test-Path $targetBase)) { New-Item -ItemType Directory -Path $targetBase | Out-Null }

# Extract distribution name and create target dir
$zipName = Split-Path -Leaf $ZipPath
if ($zipName -notmatch "gradle-(.*)-((all)|(bin)).zip") {
    Write-Host "Zip file name does not look like a Gradle distribution: $zipName" -ForegroundColor Yellow
}

$distDirName = [System.IO.Path]::GetFileNameWithoutExtension($zipName)
$destDir = Join-Path $targetBase $distDirName
if (-not (Test-Path $destDir)) { New-Item -ItemType Directory -Path $destDir | Out-Null }

$randomDir = Join-Path $destDir ([Guid]::NewGuid().ToString())
New-Item -ItemType Directory -Path $randomDir | Out-Null

$destZipPath = Join-Path $randomDir $zipName
Copy-Item -Path $ZipPath -Destination $destZipPath -Force

Write-Host "Copied $ZipPath to $destZipPath" -ForegroundColor Green
Write-Host "Now running gradlew -v (wrapper should pick up the preloaded distribution)"
try {
    Push-Location android
    if (Test-Path "gradlew.bat") { .\gradlew.bat -v } else { Write-Host "gradlew not found in android/" -ForegroundColor Yellow }
    Pop-Location
} catch {
    Write-Host "Error while running gradlew: $_" -ForegroundColor Red
}

Write-Host "Done. If gradlew now runs without trying to download, commit the wrapper changes if you updated the wrapper." -ForegroundColor Cyan
