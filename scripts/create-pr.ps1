#!/usr/bin/env pwsh
<#
PowerShell helper: Create a GitHub pull request for the current branch.
Usage:
  # set GITHUB_TOKEN env var to a Personal Access Token with repo scope
  pwsh -NoProfile -ExecutionPolicy Bypass -File scripts/create-pr.ps1 -Base main -Title "chore(build): upgrade to Java 21" -BodyFile .github/PULL_REQUEST_TEMPLATE.md

This script uses the repository's `origin` remote to derive the owner and repo.
It requires a `GITHUB_TOKEN` environment variable with `repo` scope to create a PR via the GitHub API.
#>

param(
    [string]$Base = "main",
    [string]$Title = "chore(build): upgrade to Java 21",
    [string]$BodyFile = ".github/PULL_REQUEST_TEMPLATE.md",
    [string]$Token = $env:GITHUB_TOKEN
)

if (-not $Token) {
    Write-Host "GITHUB_TOKEN not set in environment. Please export a token and retry (requires repo access)." -ForegroundColor Red
    exit 1
}

$remoteUrl = git remote get-url origin
if ($remoteUrl -match "github.com[:/](?<owner>[^/]+)/(?<repo>[^/.]+)(\.git)?") {
    $owner = $matches['owner']
    $repo = $matches['repo']
} else {
    Write-Host "Unable to parse origin remote URL: $remoteUrl" -ForegroundColor Red
    exit 1
}

$branch = git rev-parse --abbrev-ref HEAD
if (-not $branch) { Write-Host "Unable to determine current branch"; exit 1 }

if (-not (Test-Path $BodyFile)) { Write-Host "Body file $BodyFile not found - using empty body"; $body = "" } else { $body = Get-Content $BodyFile -Raw }

$uri = "https://api.github.com/repos/$owner/$repo/pulls"
$payload = @{ title = $Title; body = $body; head = $branch; base = $Base } | ConvertTo-Json -Depth 5

try {
    $response = Invoke-RestMethod -Uri $uri -Method Post -Headers @{ Authorization = "token $Token"; 'User-Agent' = "PowerShell-Script" } -ContentType 'application/json' -Body $payload
    Write-Host "Created PR: $($response.html_url)" -ForegroundColor Green
} catch {
    Write-Host "Failed to create PR: $_" -ForegroundColor Red
    exit 1
}
