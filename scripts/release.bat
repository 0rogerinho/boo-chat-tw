@echo off
setlocal enabledelayedexpansion

if "%~1"=="" (
    echo ❌ Uso: release.bat [patch^|minor^|major]
    echo.
    echo Exemplos:
    echo   release.bat patch    - Para correções (1.1.0 → 1.1.1)
    echo   release.bat minor    - Para novas funcionalidades (1.1.0 → 1.2.0)
    echo   release.bat major    - Para mudanças que quebram compatibilidade (1.1.0 → 2.0.0)
    exit /b 1
)

set TYPE=%1

echo 🚀 Iniciando processo de release...

REM Verificar se há mudanças não commitadas
git status --porcelain > temp_status.txt
set /p GIT_STATUS=<temp_status.txt
del temp_status.txt

if not "%GIT_STATUS%"=="" (
    echo ❌ Há mudanças não commitadas. Faça commit antes de criar uma release.
    echo Mudanças pendentes:
    git status --porcelain
    exit /b 1
)

echo 📝 Atualizando versão (%TYPE%)...
npm version %TYPE%

REM Obter nova versão
for /f "tokens=2 delims=:" %%a in ('npm version %TYPE%') do set NEW_VERSION=%%a
set NEW_VERSION=%NEW_VERSION:~1%

echo ✅ Nova versão: %NEW_VERSION%

echo 💾 Fazendo commit da nova versão...
git add package.json
git commit -m "chore: bump version to %NEW_VERSION%"

echo 🏷️ Criando tag v%NEW_VERSION%...
git tag "v%NEW_VERSION%"

echo 📤 Enviando tag para o repositório...
git push origin "v%NEW_VERSION%"

echo 🔨 Fazendo build e publish...
npm run publish:win

echo ✅ Release v%NEW_VERSION% criada com sucesso!
echo 🌐 Acesse: https://github.com/devrogerinho/boo-chat-tw/releases

pause
