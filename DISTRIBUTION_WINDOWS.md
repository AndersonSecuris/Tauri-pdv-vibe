# Guia de Distribuição e Compilação para Windows (Tauri)

Este projeto foi configurado com **Tauri v2** para geração de instaladores nativos para Windows (**NSIS `.exe`** e **Windows Installer `.msi`**).

---

## 🚀 Método 1: Compilação Local no Windows (1 Clique)

Se você estiver em uma máquina com Windows:

1. **Pré-requisitos**:
   - [Node.js (LTS v18 ou superior)](https://nodejs.org)
   - [Rust & Cargo](https://rustup.rs) (selecione a opção padrão com MSVC C++ Build Tools)
   - [Visual Studio C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)

2. **Executar o script automático**:
   Dê um duplo clique no arquivo:
   ```cmd
   build-windows.bat
   ```
   Ou no PowerShell:
   ```powershell
   .\build-windows.ps1
   ```

3. **Ou executar manualmente via terminal**:
   ```bash
   npm install
   npm run build
   npx tauri build
   ```

### 📦 Onde ficam os arquivos compilados?
Após o término do comando `tauri build`, seus arquivos de distribuição prontos para instalação estarão em:
- **Instalador NSIS (.exe)**: `src-tauri/target/release/bundle/nsis/CellMaster PDV e OS_1.0.0_x64-setup.exe`
- **Instalador MSI (.msi)**: `src-tauri/target/release/bundle/msi/CellMaster PDV e OS_1.0.0_x64_pt-BR.msi`
- **Executável direto (.exe portátil)**: `src-tauri/target/release/cellmaster-pdv.exe`

---

## ☁️ Método 2: Compilação Automática no GitHub Actions (Nuvem)

O repositório já inclui o arquivo `.github/workflows/build-windows.yml`.

1. Suba o projeto para um repositório no GitHub (`git push`).
2. Acesse a aba **Actions** no seu repositório.
3. Selecione o workflow **"Compilar para Windows (Tauri)"** e clique em **"Run workflow"** (ou crie uma tag `git tag v1.0.0 && git push --tags`).
4. Uma máquina virtual oficial do Windows (`windows-latest`) irá compilar o executável e disponibilizar os arquivos `.exe` e `.msi` diretamente para download nos **Artifacts** e na página de **Releases** do GitHub!

---

## 🖨️ Compatibilidade com Impressoras Térmicas ESC/POS no Windows

O aplicativo suporta comunicação direta com impressoras térmicas conectadas ao Windows:
- **Portas COM / Serial** (`COM1`, `COM2`, `COM3`, `COM4` com taxa de 9600 a 115200 bps)
- **Portas USB / Spooler do Windows** (`USB001`, `POS-80`, `Bematech MP-4200`, `Epson TM-T20`, `Elgin i9`)
- **Impressoras de Rede Ethernet / Wi-Fi** (Porta padrão `9100`)
- **Acionamento de Gaveta de Dinheiro RJ12** via pulso ESC/POS (`ESC p 0 25 250`)
- **Guilhotina Automática de Papel** (`GS V 0`)
