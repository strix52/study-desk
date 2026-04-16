$ws = New-Object -ComObject WScript.Shell
$lnkPath = [System.IO.Path]::Combine($env:APPDATA, 'Microsoft\Windows\Start Menu\Programs\Study Desk.lnk')
$shortcut = $ws.CreateShortcut($lnkPath)
$shortcut.TargetPath = Join-Path $PSScriptRoot 'start-study-desk.bat'
$shortcut.WorkingDirectory = $PSScriptRoot
$shortcut.Description = 'Launch Study Desk'
$shortcut.Save()
Write-Host "Start Menu shortcut created at: $lnkPath"
