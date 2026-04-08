$ErrorActionPreference = "Stop"

# 레포 루트 기준으로 실행 (Task Scheduler에서 cwd 유실 방지)
$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

# 로그 디렉터리
$logDir = Join-Path $repoRoot "memory\logs"
if (-not (Test-Path $logDir)) {
  New-Item -ItemType Directory -Path $logDir | Out-Null
}

$now = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$logFile = Join-Path $logDir "automation-batch.log"
"[$now] START automation:batch" | Out-File -FilePath $logFile -Append -Encoding utf8

try {
  npm run automation:batch 2>&1 | Out-File -FilePath $logFile -Append -Encoding utf8
  $done = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  "[$done] DONE automation:batch" | Out-File -FilePath $logFile -Append -Encoding utf8
} catch {
  $fail = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  "[$fail] FAIL automation:batch :: $($_.Exception.Message)" | Out-File -FilePath $logFile -Append -Encoding utf8
  throw
}
