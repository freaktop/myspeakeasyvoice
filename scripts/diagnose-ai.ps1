
# AI Connection Diagnostic Script
Write-Host "🔍 Diagnosing AI Connection Issues" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

$issues = 0

# Test 1: Check if Supabase CLI is installed
Write-Host "Test 1: Supabase CLI Installation" -ForegroundColor Yellow
$supabase = Get-Command supabase -ErrorAction SilentlyContinue
if ($supabase) {
    Write-Host "  ✓ Supabase CLI installed" -ForegroundColor Green
    try {
        $version = supabase --version 2>&1
        Write-Host "    Version: $version" -ForegroundColor Gray
    } catch {}
} else {
    Write-Host "  ✗ Supabase CLI not found" -ForegroundColor Red
    Write-Host "    Install with: npm install -g supabase" -ForegroundColor Gray
    $issues++
}

Write-Host ""

# Test 2: Check OpenAI key in .env
Write-Host "Test 2: OpenAI API Key (.env)" -ForegroundColor Yellow
$envContent = Get-Content .env -ErrorAction SilentlyContinue
$openaiKey = $envContent | Select-String "^OPENAI_API_KEY=" | ForEach-Object { $_ -replace 'OPENAI_API_KEY=','' }
if ($openaiKey) {
    Write-Host "  ✓ Key found in .env" -ForegroundColor Green
    Write-Host "    Preview: $($openaiKey.Substring(0, [Math]::Min(20, $openaiKey.Length)))..." -ForegroundColor Gray
} else {
    Write-Host "  ✗ OPENAI_API_KEY not found in .env" -ForegroundColor Red
    $issues++
}

Write-Host ""

# Test 3: Check environment URLs
Write-Host "Test 3: API Configuration" -ForegroundColor Yellow
$apiUrl = $envContent | Select-String "^VITE_API_URL="
$backendUrl = $envContent | Select-String "^VITE_BACKEND_URL="
$supabaseFuncUrl = $envContent | Select-String "^VITE_SUPABASE_FUNCTIONS_URL="

if ($apiUrl) {
    Write-Host "  ✓ VITE_API_URL: $($apiUrl -replace 'VITE_API_URL=','')" -ForegroundColor Green
} elseif ($backendUrl) {
    Write-Host "  ✓ VITE_BACKEND_URL: $($backendUrl -replace 'VITE_BACKEND_URL=','')" -ForegroundColor Green
} elseif ($supabaseFuncUrl) {
    Write-Host "  ✓ VITE_SUPABASE_FUNCTIONS_URL: $($supabaseFuncUrl -replace 'VITE_SUPABASE_FUNCTIONS_URL=','')" -ForegroundColor Green
} else {
    Write-Host "  ✗ No API URL configured" -ForegroundColor Red
    $issues++
}

Write-Host ""

# Test 4: Check if edge function file exists
Write-Host "Test 4: Edge Function Source" -ForegroundColor Yellow
if (Test-Path "supabase\functions\realtime-chat\index.ts") {
    Write-Host "  ✓ Edge function source exists" -ForegroundColor Green
} else {
    Write-Host "  ✗ Edge function source not found" -ForegroundColor Red
    $issues++
}

Write-Host ""

# Test 5: Test OpenAI key validity (if possible)
Write-Host "Test 5: OpenAI Key Validity" -ForegroundColor Yellow
if ($openaiKey) {
    Write-Host "  Testing connection to OpenAI..." -ForegroundColor Gray
    $env:OPENAI_API_KEY = $openaiKey.Trim('"')
    
    if (Test-Path "test-openai.js") {
        try {
            $result = node test-openai.js 2>&1
            if ($result -match "valid") {
                Write-Host "  ✓ OpenAI API key is valid" -ForegroundColor Green
            } else {
                Write-Host "  ✗ OpenAI API key validation failed" -ForegroundColor Red
                Write-Host "    $result" -ForegroundColor Gray
                $issues++
            }
        } catch {
            Write-Host "  ⚠ Could not test key (check test-openai.js)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  ⚠ test-openai.js not found, skipping validation" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ⊘ Skipped (no key found)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan

if ($issues -eq 0) {
    Write-Host "✅ Configuration looks good!" -ForegroundColor Green
    Write-Host ""
    Write-Host "The issue is likely that the Supabase Edge Function is not deployed yet." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To fix, run these commands:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. supabase login" -ForegroundColor White
    Write-Host "2. supabase link --project-ref zofxbilhjehbtlbtence" -ForegroundColor White
    Write-Host "3. supabase functions deploy realtime-chat" -ForegroundColor White
    Write-Host "4. supabase secrets set OPENAI_API_KEY=`"$openaiKey`"" -ForegroundColor White
    Write-Host ""
    Write-Host "Then test with: npm run dev" -ForegroundColor White
} else {
    Write-Host "❌ Found $issues issue(s) that need to be fixed first" -ForegroundColor Red
    Write-Host ""
    Write-Host "Review the errors above and fix them before deploying." -ForegroundColor Yellow
}

Write-Host ""
