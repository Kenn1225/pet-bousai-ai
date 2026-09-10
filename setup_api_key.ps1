Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  AIうちの子防災メソッド — API キー設定ツール" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "console.anthropic.com → API Keys からキーをコピーして" -ForegroundColor Yellow
Write-Host "以下のプロンプトにペーストしてください（*で隠れます）" -ForegroundColor Yellow
Write-Host ""

$secureKey = Read-Host -Prompt "ANTHROPIC_API_KEY を入力" -AsSecureString
$plain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureKey)
)

if (-not $plain.StartsWith("sk-ant-")) {
    Write-Host ""
    Write-Host "❌ キーの形式が正しくありません（sk-ant- で始まるはずです）" -ForegroundColor Red
    Write-Host "   もう一度 console.anthropic.com でキーを確認してください。" -ForegroundColor Red
    Read-Host "Enterで終了"
    exit 1
}

# 1. ユーザー環境変数に永続保存
[Environment]::SetEnvironmentVariable("ANTHROPIC_API_KEY", $plain, "User")

# 2. .env.local に書き込み
$envPath = Join-Path $PSScriptRoot ".env.local"
"ANTHROPIC_API_KEY=$plain" | Out-File -Encoding utf8NoBOM $envPath

Write-Host ""
Write-Host "✅ ユーザー環境変数に保存しました" -ForegroundColor Green
Write-Host "✅ .env.local を作成しました → $envPath" -ForegroundColor Green
Write-Host ""
Write-Host "次のステップ：" -ForegroundColor Cyan
Write-Host "  このウィンドウを閉じて、VSCode（またはターミナル）で" -ForegroundColor White
Write-Host "  C:\Users\Owner\pet-bousai-ai に移動して" -ForegroundColor White
Write-Host "  npm run dev  を実行してください。" -ForegroundColor White
Write-Host ""
Read-Host "Enterで終了"
