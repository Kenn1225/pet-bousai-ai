# PDPA-100 PPTX を PNG に書き出して目視確認するためのスクリプト
# 使い方: powershell -ExecutionPolicy Bypass -File .\export_preview.ps1
param(
  [string]$Pptx = "$PSScriptRoot\PDPA-100_official_education_system.pptx",
  [string]$OutDir = "$PSScriptRoot\preview"
)

if (-not (Test-Path $Pptx)) { throw "pptx not found: $Pptx" }
if (Test-Path $OutDir) { Remove-Item -Recurse -Force $OutDir }
New-Item -ItemType Directory -Force $OutDir | Out-Null

$ppt = New-Object -ComObject PowerPoint.Application
try {
  $pres = $ppt.Presentations.Open($Pptx, $true, $false, $false)
  # SaveCopyAs ではフォルダ出力できないため Export を使う
  $pres.Export($OutDir, "PNG", 1600, 900)
  $pres.Close()
} finally {
  $ppt.Quit()
}

# 出力名は「スライドN.PNG」になるので ASCII 名にそろえる（VSCode でリンクが開くように）
Get-ChildItem $OutDir -Filter *.PNG | ForEach-Object {
  if ($_.BaseName -match '(\d+)$') {
    Rename-Item $_.FullName -NewName ("slide_{0:d2}.png" -f [int]$Matches[1])
  }
}
Get-ChildItem $OutDir | Sort-Object Name | Select-Object Name, Length | Format-Table -AutoSize
