

param(
    [Parameter(Position=0)]
    [string]$Command = "help"
)

$VENV    = "backend\venv"
$PIP     = "$VENV\Scripts\pip.exe"
$PY      = "$VENV\Scripts\python.exe"
$Root    = $PSScriptRoot

function Get-LocalIP {
    $ip = (Get-NetIPAddress -AddressFamily IPv4 |
           Where-Object { $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.254.*" } |
           Sort-Object -Property PrefixLength -Descending |
           Select-Object -First 1).IPAddress
    if (-not $ip) { $ip = "localhost" }
    return $ip
}

function Invoke-Setup {
    if (-not (Test-Path ".env")) {
        Copy-Item ".env.example" ".env"
        Write-Host ">>> .env criado a partir de .env.example."
        Write-Host ">>> Preencha as variáveis antes de iniciar o projeto."
    } else {
        Write-Host ">>> .env já existe, nenhuma ação necessária."
    }
}

function Invoke-SetupDev {
    $ip = Get-LocalIP
    $envContent = "VITE_API_URL=http://${ip}:5001`nLOCAL_IP=$ip"
    # Use UTF-8 without BOM — PowerShell 5 Set-Content -Encoding UTF8 adds BOM,
    # which breaks dotenv parsing (key becomes ﻿VITE_API_URL instead of VITE_API_URL).
    [System.IO.File]::WriteAllText(
        "$Root\frontend\.env.local",
        $envContent,
        [System.Text.UTF8Encoding]::new($false)
    )
    Write-Host ">>> frontend\.env.local criado com IP: $ip"
}

function Invoke-InstallBackend {
    if (-not (Test-Path $VENV)) {
        python -m venv $VENV
        Write-Host ">>> Ambiente virtual criado em $VENV"
    }
    & $PIP install --upgrade pip
    & $PIP install -r backend\requirements.txt
    Write-Host ">>> Dependências Python instaladas."
}

function Invoke-InstallFrontend {
    Push-Location frontend
    npm install
    Pop-Location
    Write-Host ">>> Dependências Node instaladas."
}

function Invoke-Install {
    Invoke-InstallBackend
    Invoke-InstallFrontend
    Write-Host ">>> Todas as dependências instaladas com sucesso."
}

function Invoke-Dev {
    Invoke-SetupDev
    $env:VIRTUAL_ENV = "$Root\$VENV"
    $env:PATH = "$Root\$VENV\Scripts;$env:PATH"
    npm run dev
}

function Invoke-Backend {
    & $PY -m backend.src.main
}

function Invoke-Frontend {
    Push-Location frontend
    npm run dev
    Pop-Location
}

function Invoke-MobileSync {
    Invoke-SetupDev
    $ip = Get-LocalIP
    $env:LOCAL_IP = $ip
    Push-Location frontend
    npx cap sync
    Pop-Location
    Write-Host ">>> Sincronizado! Abra o Android Studio e clique em Run."
}

function Invoke-Test {
    & $PY -m pytest backend\tests\ -v
}

function Invoke-Lint {
    Push-Location frontend
    npm run lint
    Pop-Location
}

function Invoke-Clean {
    if (Test-Path $VENV)                    { Remove-Item -Recurse -Force $VENV }
    if (Test-Path "frontend\node_modules")  { Remove-Item -Recurse -Force "frontend\node_modules" }
    if (Test-Path "frontend\dist")          { Remove-Item -Recurse -Force "frontend\dist" }
    Get-ChildItem -Recurse -Filter "__pycache__" -Directory | Remove-Item -Recurse -Force
    Get-ChildItem -Recurse -Filter "*.pyc" | Remove-Item -Force
    Write-Host ">>> Limpeza concluída."
}

# ── Roteamento de comandos ───────────────────────────────────────────────────

Set-Location $Root

switch ($Command) {
    "help"             { Invoke-Help }
    "setup"            { Invoke-Setup }
    "setup-dev"        { Invoke-SetupDev }
    "install-backend"  { Invoke-InstallBackend }
    "install-frontend" { Invoke-InstallFrontend }
    "install"          { Invoke-Install }
    "dev"              { Invoke-Dev }
    "backend"          { Invoke-Backend }
    "frontend"         { Invoke-Frontend }
    "mobile-sync"      { Invoke-MobileSync }
    "test"             { Invoke-Test }
    "lint"             { Invoke-Lint }
    "clean"            { Invoke-Clean }
    default {
        Write-Host "Comando '$Command' não reconhecido. Execute '.\make.ps1 help' para ver os comandos disponíveis." -ForegroundColor Red
        exit 1
    }
}
