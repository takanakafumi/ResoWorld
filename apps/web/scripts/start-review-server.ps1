$ErrorActionPreference = "Stop"

$appDirectory = Split-Path -Parent $PSScriptRoot
$reviewUrl = "http://localhost:3000/review"
$nextDirectory = Join-Path $appDirectory ".next"
$logPath = Join-Path $nextDirectory "review-dev-server.log"
$pidPath = Join-Path $nextDirectory "review-dev-server.pid"

try {
  $response = Invoke-WebRequest -Uri $reviewUrl -UseBasicParsing -TimeoutSec 2
  if ($response.StatusCode -eq 200) {
    Write-Output "ResoWorld review server is already ready: $reviewUrl"
    exit 0
  }
} catch {
  # Start the server below.
}

New-Item -ItemType Directory -Path $nextDirectory -Force | Out-Null
$process = Start-Process `
  -FilePath "cmd.exe" `
  -ArgumentList "/d", "/c", "pnpm dev > `"$logPath`" 2>&1" `
  -WorkingDirectory $appDirectory `
  -WindowStyle Hidden `
  -PassThru
$process.Id | Set-Content -LiteralPath $pidPath

for ($attempt = 0; $attempt -lt 30; $attempt += 1) {
  Start-Sleep -Milliseconds 500
  if ($process.HasExited) {
    throw "ResoWorld review server exited during startup. See $logPath"
  }
  try {
    $response = Invoke-WebRequest -Uri $reviewUrl -UseBasicParsing -TimeoutSec 2
    if ($response.StatusCode -eq 200) {
      Write-Output "ResoWorld review server is ready: $reviewUrl (PID $($process.Id))"
      exit 0
    }
  } catch {
    # Keep waiting until the startup deadline.
  }
}

throw "ResoWorld review server did not become ready. See $logPath"
