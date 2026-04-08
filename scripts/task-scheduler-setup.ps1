$ErrorActionPreference = "Stop"

$taskName = "YohanOS-AutomationBatch-30min"
$runner = Join-Path $PSScriptRoot "run-automation-batch.ps1"
$runnerVbs = Join-Path $PSScriptRoot "run-automation-batch-hidden.vbs"
$wscript = Join-Path $env:WINDIR "System32\wscript.exe"

if (-not (Test-Path $runner)) {
  throw "Runner script not found: $runner"
}
if (-not (Test-Path $runnerVbs)) {
  throw "Hidden VBS runner not found: $runnerVbs"
}
if (-not (Test-Path $wscript)) {
  throw "wscript.exe not found: $wscript"
}

# 버전/로캘별 schtasks 인수 파싱 이슈 회피:
# 30분 반복 대신 "매일 00:00~23:30, 30분 간격" 트리거 48개를 등록한다.
$arg = "`"$runnerVbs`""
$action = New-ScheduledTaskAction -Execute $wscript -Argument $arg

$triggers = @()
for ($h = 0; $h -lt 24; $h++) {
  foreach ($m in @(0, 30)) {
    $time = (Get-Date -Hour $h -Minute $m -Second 0)
    $triggers += New-ScheduledTaskTrigger -Daily -At $time
  }
}

$settings = New-ScheduledTaskSettingsSet `
  -StartWhenAvailable `
  -AllowStartIfOnBatteries `
  -DontStopIfGoingOnBatteries `
  -MultipleInstances IgnoreNew `
  -ExecutionTimeLimit (New-TimeSpan -Minutes 25)

# 관리자 권한이면 Highest로, 일반 권한이면 현재 사용자 컨텍스트로 fallback
try {
  Register-ScheduledTask `
    -TaskName $taskName `
    -User "$env:UserDomain\$env:UserName" `
    -RunLevel Highest `
    -Action $action `
    -Trigger $triggers `
    -Settings $settings `
    -Description "Yohan OS automation batch every 30 minutes (48 daily triggers, hidden vbs)" `
    -Force | Out-Null
} catch {
  Register-ScheduledTask `
    -TaskName $taskName `
    -Action $action `
    -Trigger $triggers `
    -Settings $settings `
    -Description "Yohan OS automation batch every 30 minutes (user-level, hidden vbs)" `
    -Force | Out-Null
  Write-Host "Registered without -RunLevel Highest (non-admin fallback)."
}

Write-Host "Registered task: $taskName"
Write-Host "Run now: Start-ScheduledTask -TaskName `"$taskName`""
Write-Host "Delete : Unregister-ScheduledTask -TaskName `"$taskName`" -Confirm:`$false"
