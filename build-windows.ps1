# CellMaster PDV & Ordem de Serviço - Script de Compilação Windows PowerShell
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  CellMaster PDV & OS - Compilação Nativa para Windows" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verifica Node.js
if (-not (Get-Command "node" -ErrorAction SilentlyContinue)) {
    Write-Error "Node.js não foi encontrado. Instale em https://nodejs.org"
    exit 1
}

# 2. Verifica Rust
if (-not (Get-Command "cargo" -ErrorAction SilentlyContinue)) {
    Write-Error "Rust e Cargo não foram encontrados. Instale em https://rustup.rs"
    exit 1
}

Write-Host "[1/3] Instalando dependências e compilando frontend Vite..." -ForegroundColor Green
npm install
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Error "Falha ao compilar o frontend."
    exit $LASTEXITCODE
}

Write-Host "[2/3] Compilando executáveis e instaladores com Tauri CLI..." -ForegroundColor Green
npx tauri build

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================================" -ForegroundColor Green
    Write-Host "  SUCESSO! Aplicativo Windows compilado com sucesso." -ForegroundColor Green
    Write-Host "========================================================" -ForegroundColor Green
    Write-Host "Arquivos gerados:"
    Write-Host "  - Instalador .exe: src-tauri\target\release\bundle\nsis\" -ForegroundColor Yellow
    Write-Host "  - Instalador .msi: src-tauri\target\release\bundle\msi\" -ForegroundColor Yellow
    Write-Host "  - Binário direto:  src-tauri\target\release\cellmaster-pdv.exe" -ForegroundColor Yellow
} else {
    Write-Error "Falha durante o build com Tauri CLI."
    exit $LASTEXITCODE
}
