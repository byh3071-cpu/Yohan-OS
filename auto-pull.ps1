$repoPath = "C:\Users\user\Desktop\AI 1인 기업\Yohan OS"
$logPath = "C:\Users\user\git-autopull.log"
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

Set-Location $repoPath
$pullOutput = (& git pull origin master --ff-only 2>&1 | Out-String).Trim()
$exitCode = $LASTEXITCODE

if ($exitCode -eq 0) {
  Add-Content -Path $logPath -Value "[$timestamp] SUCCESS branch=master exit=$exitCode"
  Add-Content -Path $logPath -Value $pullOutput
  Add-Content -Path $logPath -Value ""
} else {
  Add-Content -Path $logPath -Value "[$timestamp] ERROR branch=master exit=$exitCode"
  Add-Content -Path $logPath -Value $pullOutput
  Add-Content -Path $logPath -Value ""
}
