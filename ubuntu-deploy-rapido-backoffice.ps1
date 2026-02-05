# ============================================
# Deploy Rápido - BackOffice (compatível com PowerShell no Ubuntu)
# - Usa paths UNIX
# - Gera tar.gz antes do envio
# - Executa comandos remotos via ssh (pipe para 'bash -s')
# ============================================

param(
    [Parameter(Mandatory=$true)]
    [string]$EC2_IP,

    [Parameter(Mandatory=$true)]
    [string]$KeyPath
)

$ErrorActionPreference = 'Stop'

Write-Host "🚀 Deploy Rápido BackOffice (Ubuntu PowerShell)" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

# Use o diretório `Academy-Backoffice` quando o script for executado a partir da pasta pai
$cwd = (Get-Location).ProviderPath
if (Test-Path (Join-Path $cwd 'Academy-Backoffice')) {
    $BaseDir = Join-Path $cwd 'Academy-Backoffice'
} elseif ((Split-Path $cwd -Leaf) -ieq 'Academy-Backoffice') {
    $BaseDir = $cwd
} else {
    # Tenta localizar a pasta abaixo do diretório atual
    $found = Get-ChildItem -Directory -Path $cwd -Filter 'Academy-Backoffice' -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($found) { $BaseDir = $found.FullName } else { Write-Host "Não encontrei a pasta 'Academy-Backoffice' a partir de: $cwd" -ForegroundColor Red; exit 1 }
}

$TempDir = "/tmp/deploy-backoffice-$PID"

Set-Location $BaseDir


# 0. Usar .env.local do projeto, se existir
Write-Host "`n🔧 Verificando .env.local..." -ForegroundColor Cyan
$envLocalPath = Join-Path $BaseDir '.env.local'
if (Test-Path $envLocalPath) {
    Write-Host "✓ Usando .env.local existente do projeto." -ForegroundColor Green
} else {
    Write-Host "⚠ .env.local não encontrado no projeto, criando padrão." -ForegroundColor Yellow
    $envContent = @"
NEXT_PUBLIC_API_URL=https://academyserver.jneumann.com.br
"@
    Set-Content -Path $envLocalPath -Value $envContent -NoNewline -Encoding UTF8
}
Get-Content $envLocalPath | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }

# 1. Build
Write-Host "`n📦 Fazendo build com API URL correto..." -ForegroundColor Cyan
if (Test-Path (Join-Path $BaseDir '.next')) { Remove-Item -Path (Join-Path $BaseDir '.next') -Recurse -Force -ErrorAction SilentlyContinue }

npm run build
$buildExitCode = $LASTEXITCODE
if ($buildExitCode -ne 0) {
    Write-Host "❌ Build falhou com código: $buildExitCode" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Build concluído com sucesso!" -ForegroundColor Green

if (-not (Test-Path (Join-Path $BaseDir '.next'))) {
    Write-Host "❌ Pasta .next não foi criada!" -ForegroundColor Red
    exit 1
}

# 2. Criar diretório temporário
if (-not (Test-Path $TempDir)) { New-Item -ItemType Directory -Path $TempDir | Out-Null }

# 3. Criar tar.gz com .next, public e .env.local
Write-Host "`n📦 Compactando arquivos em tar.gz..." -ForegroundColor Cyan
$archive = Join-Path $TempDir 'backoffice-build.tar.gz'

# Copia o script de deploy para a pasta do projeto antes de compactar
$deployScript = Join-Path $cwd 'deploy-remote-backoffice.sh'
if (Test-Path $deployScript) {
    $destScript = Join-Path $BaseDir 'deploy-remote-backoffice.sh'
    if ($deployScript -ne $destScript) {
        Copy-Item $deployScript -Destination $BaseDir -Force
    }
} else {
    Write-Host "⚠ Script deploy-remote-backoffice.sh não encontrado em $cwd!" -ForegroundColor Yellow
}

if (Get-Command tar -ErrorAction SilentlyContinue) {
    & tar -C $BaseDir -czf $archive .next public .env.local deploy-remote-backoffice.sh
} else {
    Write-Host "Aviso: 'tar' não encontrado. Usando zip como fallback..." -ForegroundColor Yellow
    $archiveZip = Join-Path $TempDir 'backoffice-build.zip'
    if (-not (Get-Command zip -ErrorAction SilentlyContinue)) {
        Write-Host "Por favor instale 'zip' ou 'tar' no sistema." -ForegroundColor Red
        exit 1
    }
    Push-Location $BaseDir
    & zip -r -q $archiveZip .next public .env.local deploy-remote-backoffice.sh
    Pop-Location
    $archive = $archiveZip
}

$sizeMB = [math]::Round((Get-Item $archive).Length / 1MB, 2)
Write-Host "  ✓ Arquivo criado: $sizeMB MB" -ForegroundColor Green

# Valida a chave SSH
if (-not (Test-Path $KeyPath)) {
    Write-Host "Arquivo de chave não encontrado: $KeyPath" -ForegroundColor Red
    exit 1
}

# 4. Enviar arquivo para EC2
Write-Host "`n📤 Enviando para EC2 ($sizeMB MB)..." -ForegroundColor Cyan
scp -i $KeyPath $archive "ubuntu@${EC2_IP}:/tmp/"
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Falha ao enviar arquivo!" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Arquivo enviado com sucesso!" -ForegroundColor Green

# Envia o script de deploy para /var/www/academia na instância
$deployScriptPath = Join-Path $BaseDir 'deploy-remote-backoffice.sh'
if (Test-Path $deployScriptPath) {
    scp -i $KeyPath $deployScriptPath "ubuntu@${EC2_IP}:/var/www/academia/"
}


Write-Host "\nConecte via SSH na EC2, navegue até a pasta do projeto e execute o script de deploy manualmente:" -ForegroundColor Yellow
Write-Host "cd /var/www/academia/backoffice" -ForegroundColor Yellow
Write-Host "bash deploy-remote-backoffice.sh" -ForegroundColor Yellow

# 6. Limpar arquivo local
Write-Host "`n🧹 Limpando arquivos temporários..." -ForegroundColor Cyan
Remove-Item -Path $archive -ErrorAction SilentlyContinue
Remove-Item -Path $TempDir -Recurse -Force -ErrorAction SilentlyContinue

# 7. Resumo
Write-Host "`n============================================" -ForegroundColor Green
Write-Host "✅ Deploy concluído com API URL correto!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "🔗 API configurada: https://academyserver.jneumann.com.br" -ForegroundColor Cyan
Write-Host "🌐 Acesse: https://effortbackoffice.jneumann.com.br" -ForegroundColor Cyan
Write-Host "💡 Login: admin@academia.com / admin123" -ForegroundColor Yellow
Write-Host ""
Write-Host "⏱️  Aguarde alguns segundos e tente fazer login!" -ForegroundColor Yellow
