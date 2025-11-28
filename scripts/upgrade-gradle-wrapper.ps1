#!/usr/bin/env pwsh
Write-Host "Updating Gradle wrapper to a target version (8.16.0). This will download the Gradle distribution and update wrapper files."
param(
    [string]$TargetVersion = "8.16.0"
)
Try {
    if (-not (Test-Path -Path './gradlew.bat')) {
        Write-Host "gradlew wrapper not found; ensure you are in an Android or root project that includes the Gradle wrapper."
        exit 1
    }
    Write-Host "Running: .\gradlew.bat wrapper --gradle-version $TargetVersion"
    .\gradlew.bat wrapper --gradle-version $TargetVersion
    Write-Host "Wrapper update finished. You may need to re-run the build to download the new Gradle distribution."
} catch {
    Write-Host "An error occurred while updating the Gradle wrapper: $_"
    exit 2
}
