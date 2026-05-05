# Script para Iniciar o Sistema Completo (Banco + Backend + Frontend)
# Execute com: .\start_automated.ps1

Write-Host "╔═══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                       ║" -ForegroundColor Cyan
Write-Host "║   🚀 Iniciando Sistema de Gestão de TI (Automático)  ║" -ForegroundColor Cyan
Write-Host "║                                                       ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# 1. Iniciar MongoDB
Write-Host "📦 Verificando MongoDB..." -ForegroundColor Yellow
$mongoBin = "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe"
$mongoData = Join-Path $PSScriptRoot "mongo_data"

if (Test-Path $mongoBin) {
    if (-not (Test-Path $mongoData)) {
        New-Item -ItemType Directory -Path $mongoData -Force | Out-Null
        Write-Host "   Pasta de dados criada: $mongoData" -ForegroundColor Gray
    }
    
    # Iniciar Mongod em processo separado
    $mongoProcess = Start-Process -FilePath $mongoBin -ArgumentList "--dbpath `"$mongoData`" --bind_ip 127.0.0.1 --port 27017" -PassThru -WindowStyle Minimized
    Write-Host "✅ MongoDB iniciado (PID: $($mongoProcess.Id))" -ForegroundColor Green
}
else {
    Write-Host "⚠️  MongoDB não encontrado em $mongoBin. Verifique a instalação." -ForegroundColor Red
}

Write-Host ""

# 2. Iniciar Backend
Write-Host "⚙️  Iniciando Backend..." -ForegroundColor Yellow
$backendJob = Start-Job -ScriptBlock {
    $env:MONGODB_URI = 'mongodb://localhost:27017/gestao_ti'
    $env:PORT = 5005
    $env:JWT_SECRET = 'dev_secret'
    $env:NODE_ENV = 'development'
    
    Set-Location $using:PWD\backend
    npm run dev
}
Write-Host "✅ Backend iniciando em http://localhost:5005" -ForegroundColor Green

# 3. Iniciar Frontend
Write-Host "🎨 Iniciando Frontend..." -ForegroundColor Yellow
$frontendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD\frontend
    npm run dev
}
Write-Host "✅ Frontend iniciando em http://localhost:5180" -ForegroundColor Green

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║   ✅ SISTEMA RODANDO!                                ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Frontend: http://localhost:5180" -ForegroundColor Cyan
Write-Host "🔌 Backend:  http://localhost:5005" -ForegroundColor Cyan
Write-Host ""
Write-Host "👥 Credenciais Padrão:" -ForegroundColor Yellow
Write-Host "   Admin:    admin@gestao.com    / admin123" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  Mantenha esta janela aberta para manter os Jobs rodando." -ForegroundColor Gray
Write-Host "   Pressione Enter para encerrar tudo." -ForegroundColor Gray

Read-Host
Stop-Job -Job $backendJob, $frontendJob
if ($mongoProcess) { Stop-Process -Id $mongoProcess.Id -ErrorAction SilentlyContinue }
