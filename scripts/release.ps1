# Script para criar releases do BooChat
param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("patch", "minor", "major")]
    [string]$Type,
    
    [Parameter(Mandatory=$false)]
    [string]$Message = ""
)

Write-Host "🚀 Iniciando processo de release..." -ForegroundColor Green

# Verificar se há mudanças não commitadas
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "❌ Há mudanças não commitadas. Faça commit antes de criar uma release." -ForegroundColor Red
    Write-Host "Mudanças pendentes:" -ForegroundColor Yellow
    Write-Host $gitStatus
    exit 1
}

# Atualizar versão
Write-Host "📝 Atualizando versão ($Type)..." -ForegroundColor Blue
npm version $Type

# Obter nova versão
$newVersion = node -p "require('./package.json').version"
Write-Host "✅ Nova versão: $newVersion" -ForegroundColor Green

# Fazer commit da nova versão
Write-Host "💾 Fazendo commit da nova versão..." -ForegroundColor Blue
git add package.json
git commit -m "chore: bump version to $newVersion"

# Criar tag
Write-Host "🏷️ Criando tag v$newVersion..." -ForegroundColor Blue
git tag "v$newVersion"

# Push da tag
Write-Host "📤 Enviando tag para o repositório..." -ForegroundColor Blue
git push origin "v$newVersion"

# Build e publish
Write-Host "🔨 Fazendo build e publish..." -ForegroundColor Blue
npm run publish:win

Write-Host "✅ Release v$newVersion criada com sucesso!" -ForegroundColor Green
Write-Host "🌐 Acesse: https://github.com/devrogerinho/boo-chat-tw/releases" -ForegroundColor Cyan
