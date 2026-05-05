# Script para Parar o Sistema

Write-Host "╔═══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                       ║" -ForegroundColor Cyan
Write-Host "║   🛑 Parando Sistema de Gestão de TI                 ║" -ForegroundColor Cyan
Write-Host "║                                                       ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Parar Frontend (porta 5180)
Write-Host "⏳ Parando processos na porta 5180 (Frontend)..." -ForegroundColor Yellow
$frontendPids = (Get-NetTCPConnection -LocalPort 5180 -ErrorAction SilentlyContinue).OwningProcess
if ($frontendPids) {
    foreach ($pid in $frontendPids) {
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        Write-Host "✅ Processo $pid (Frontend) encerrado." -ForegroundColor Green
    }
}
else {
    Write-Host "Nenhum processo Frontend encontrado na porta 5180." -ForegroundColor Gray
}

# Parar Backend (porta 5005)
Write-Host "⏳ Parando processos na porta 5005 (Backend)..." -ForegroundColor Yellow
$backendPids = (Get-NetTCPConnection -LocalPort 5005 -ErrorAction SilentlyContinue).OwningProcess
if ($backendPids) {
    foreach ($pid in $backendPids) {
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        Write-Host "✅ Processo $pid (Backend) encerrado." -ForegroundColor Green
    }
}
else {
    Write-Host "Nenhum processo Backend encontrado na porta 5005." -ForegroundColor Gray
}

# Parar processos Node.js 'zumbis' (opcional, pode encerrar outros nodes se houver)
Write-Host "⏳ Verificando processos Node.js residuais..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    foreach ($process in $nodeProcesses) {
        # Tenta matar se for seguro, ou informa o usuário
        Write-Host "⚠️ Processo Node residual encontrado (PID: $($process.Id)). Pode pertencer ao sistema." -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "✅ Sistema parado." -ForegroundColor Green
Write-Host ""
