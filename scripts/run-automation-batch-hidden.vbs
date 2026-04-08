Option Explicit

Dim fso, shell, scriptDir, ps1Path, cmd
Set fso = CreateObject("Scripting.FileSystemObject")
Set shell = CreateObject("WScript.Shell")

scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
ps1Path = scriptDir & "\run-automation-batch.ps1"

cmd = "powershell.exe -NoProfile -ExecutionPolicy Bypass -File """ & ps1Path & """"

' 0 = hidden window, False = do not wait
shell.Run cmd, 0, False
