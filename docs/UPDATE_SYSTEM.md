# Sistema de Atualizações Automáticas

Este documento explica como o sistema de atualizações automáticas funciona no BooChat.

## Como Funciona

O sistema de atualizações automáticas utiliza o `electron-updater` para verificar e baixar atualizações do GitHub Releases.

### Configuração

1. **Repositório GitHub**: O app está configurado para buscar atualizações em `https://github.com/0rogerinho/boo-chat-tw`
2. **Verificação Automática**: O app verifica atualizações automaticamente 5 segundos após iniciar (apenas em produção)
3. **Download Manual**: O usuário pode verificar atualizações manualmente através da interface

### Fluxo de Atualização

1. **Verificação**: O app verifica se há uma nova versão disponível
2. **Notificação**: Se houver atualização, uma notificação aparece para o usuário
3. **Download**: O usuário pode escolher baixar a atualização
4. **Instalação**: Após o download, o usuário pode instalar a atualização
5. **Reinicialização**: O app reinicia automaticamente após a instalação

## Como Criar uma Nova Release

### 1. Atualizar a Versão

```bash
# Atualizar a versão no package.json
npm version patch  # para correções (1.1.0 -> 1.1.1)
npm version minor  # para novas funcionalidades (1.1.0 -> 1.2.0)
npm version major  # para mudanças que quebram compatibilidade (1.1.0 -> 2.0.0)
```

### 2. Criar Tag e Push

```bash
# Criar tag
git tag v1.1.1
git push origin v1.1.1
```

### 3. GitHub Actions

O GitHub Actions irá automaticamente:
- Fazer build do app para Windows, macOS e Linux
- Criar uma release no GitHub
- Fazer upload dos arquivos de instalação

### 4. Verificar Release

1. Acesse https://github.com/0rogerinho/boo-chat-tw/releases
2. Verifique se a release foi criada com os arquivos corretos
3. Os usuários receberão a notificação de atualização automaticamente

## Arquivos de Configuração

### package.json
- `repository`: URL do repositório GitHub
- `publish`: Configuração do provider GitHub
- Scripts de build e publish

### electron-builder.yml
- Configuração de build para diferentes plataformas
- Configuração de publish para GitHub

### .github/workflows/build-and-release.yml
- Workflow do GitHub Actions para build automático
- Criação automática de releases

## Troubleshooting

### O app não está verificando atualizações
- Verifique se está rodando em modo produção (`NODE_ENV=production`)
- Verifique se o repositório está configurado corretamente
- Verifique os logs do electron-log

### Erro ao baixar atualização
- Verifique se a release existe no GitHub
- Verifique se os arquivos estão corretos na release
- Verifique a conectividade com a internet

### Erro ao instalar atualização
- Verifique se o app tem permissões de escrita
- Verifique se não há outros processos usando o app
- Reinicie o app e tente novamente

## Logs

Os logs do sistema de atualizações são salvos em:
- **Windows**: `%USERPROFILE%\AppData\Roaming\boochat-tw\logs\`
- **macOS**: `~/Library/Logs/boochat-tw/`
- **Linux**: `~/.config/boochat-tw/logs/`

## Desenvolvimento

Para testar o sistema de atualizações em desenvolvimento:

1. Faça build do app: `npm run build:win`
2. Execute o app buildado
3. Crie uma release de teste no GitHub
4. O app deve detectar a atualização

**Nota**: O sistema só funciona com apps buildados, não em modo desenvolvimento.
