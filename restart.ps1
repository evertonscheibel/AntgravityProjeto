# Script para Reiniciar o Sistema

Write-Host "╔═══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                       ║" -ForegroundColor Cyan
Write-Host "║   🔄 Reiniciando Sistema de Gestão de TI             ║" -ForegroundColor Cyan
Write-Host "║                                                       ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$scriptPath = $PSScriptRoot

# 1. Parar o sistema
Write-Host "Executando stop.ps1..." -ForegroundColor Yellow
& "$scriptPath\stop.ps1"

# Pequeno atraso para garantir liberação das portas
Start-Sleep -Seconds 2

# 2. Iniciar o sistema
Write-Host "Executando start.ps1..." -ForegroundColor Yellow
& "$scriptPath\start.ps1"

Write-Host ""
Write-Host "✅ Reinício completo." -ForegroundColor Green
Write-Host ""
