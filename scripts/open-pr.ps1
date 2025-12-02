<#
PowerShell helper to open a draft PR using the GitHub REST API.
Usage: Set the environment variable GITHUB_TOKEN (PAT with repo scope) and run:
  powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\open-pr.ps1
#>

param()

if (-not $env:GITHUB_TOKEN) {
    Write-Host "Set environment variable GITHUB_TOKEN first (a personal access token with repo permissions).";
    exit 1
}

$owner = 'freaktop'
$repo = 'routine-voice-pilot'
$head = 'upgrade/java-21'
$base = 'main'
$title = 'chore(build): upgrade Java to 21 and enable Gradle toolchains, CI matrix (Java 17 & 21)'
$body = @'
This PR upgrades the project to Java 21 for compile and Kotlin JVM target.

Key changes:
- Enforce Java 21 in Gradle toolchain configuration.
- Add Gradle toolchain auto-download recommendation in `gradle.properties`.
- Update `build.gradle` and `app/build.gradle` to use Java 21 and Kotlin jvmTarget 21.
- Add CI changes: test both Java 17 and Java 21; add a `verify-toolchain` debug job (Linux + Windows) and upload Gradle logs on failure.
- Add `scripts/install-jdk21.ps1` with fallback installers and `scripts/setup-android.ps1` for local setup.

This PR keeps Java 17 in CI matrix for backward compatibility.
'@

$uri = "https://api.github.com/repos/$owner/$repo/pulls"

$payload = @{
    title = $title
    head = $head
    base = $base
    body = $body
    draft = $true
} | ConvertTo-Json -Depth 5

$headers = @{ Authorization = "token $env:GITHUB_TOKEN"; Accept = 'application/vnd.github+json' }

$resp = Invoke-RestMethod -Uri $uri -Method Post -Headers $headers -Body $payload -ErrorAction Stop

Write-Host "PR created: $($resp.html_url)"
