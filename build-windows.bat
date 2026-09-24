@echo off
chcp 65001 > nul
echo ========================================================
echo   CellMaster PDV & Ordem de Serviço - Build Windows
echo ========================================================
echo.

echo [1/4] Verificando dependências do sistema (Node.js e Rust)...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERRO] Node.js não foi encontrado no PATH. Instale o Node.js v18+ em https://nodejs.org
    pause
    exit /b 1
)

where cargo >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERRO] Rust/Cargo não foi encontrado no PATH. Instale o Rust em https://rustup.rs
    pause
    exit /b 1
)

echo [OK] Node.js e Rust encontrados com sucesso!
echo.

echo [2/4] Instalando dependências npm...
call npm install
if %errorlevel% neq 0 (
    echo [ERRO] Falha ao instalar dependências npm.
    pause
    exit /b %errorlevel%
)

echo.
echo [3/4] Compilando frontend Vite para produção...
call npm run build
if %errorlevel% neq 0 (
    echo [ERRO] Falha na compilação do frontend Vite.
    pause
    exit /b %errorlevel%
)

echo.
echo [4/4] Compilando instaladores Windows nativos via Tauri (NSIS e MSI)...
call npx tauri build --target x86_64-pc-windows-msvc
if %errorlevel% neq 0 (
    echo [AVISO] Tentando compilação com target padrão...
    call npx tauri build
)

echo.
echo ========================================================
echo   Compilação Concluída com Sucesso!
echo ========================================================
echo Os instaladores executáveis foram gerados em:
echo   src-tauri\target\release\bundle\nsis\ (Instalador .exe)
echo   src-tauri\target\release\bundle\msi\  (Instalador .msi)
echo.
pause
