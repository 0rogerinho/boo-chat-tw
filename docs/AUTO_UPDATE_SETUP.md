# Configuração do Auto-Update

Este documento explica como o sistema de auto-update foi configurado no BooChat.

## Configuração Implementada

### 1. Dependências
- `electron-updater`: Instalado para gerenciar atualizações automáticas

### 2. Configuração do Main Process
- **Arquivo**: `src/main/index.ts`
- **Funcionalidades**:
  - Verificação automática de atualizações na inicialização
  - Verificação periódica a cada 4 horas
  - Eventos de notificação para o renderer process
  - Logs detalhados do processo de atualização

### 3. Configuração do IPC
- **Arquivo**: `src/main/home/ipc.ts`
- **Handlers disponíveis**:
  - `check-for-updates`: Verifica se há atualizações disponíveis
  - `download-update`: Baixa a atualização
  - `install-update`: Instala a atualização
  - `get-app-version`: Retorna a versão atual do app

### 4. Configuração do Preload
- **Arquivo**: `src/preload/index.ts` e `src/preload/index.d.ts`
- **APIs expostas**:
  - `window.api.checkForUpdates()`
  - `window.api.downloadUpdate()`
  - `window.api.installUpdate()`
  - `window.api.getAppVersion()`

### 5. Configuração do Electron Builder
- **Arquivo**: `electron-builder.yml`
- **Provider**: GitHub
- **Configurações**:
  - Owner: `devrogerinho`
  - Repo: `boo-chat-tw`
  - Release type: `release`
  - Private: `false`

## Como Usar

### 1. Hook Personalizado
```tsx
import { useAutoUpdater } from '../shared/hooks/useAutoUpdater'

const MyComponent = () => {
  const {
    appVersion,
    updateInfo,
    isUpdateAvailable,
    isUpdateDownloaded,
    checkForUpdates,
    downloadUpdate,
    installUpdate
  } = useAutoUpdater()

  // Usar os estados e funções conforme necessário
}
```

### 2. Componente de Notificação
```tsx
import { UpdateNotification } from '../shared/components/UpdateNotification'

const App = () => {
  return (
    <div>
      <UpdateNotification />
      {/* Resto da sua aplicação */}
    </div>
  )
}
```

## Processo de Release

### 🚀 **Método 1: Scripts Automatizados (Recomendado)**

#### Windows (PowerShell)
```powershell
# Para correções (1.1.0 → 1.1.1)
.\scripts\release.ps1 patch

# Para novas funcionalidades (1.1.0 → 1.2.0)
.\scripts\release.ps1 minor

# Para mudanças que quebram compatibilidade (1.1.0 → 2.0.0)
.\scripts\release.ps1 major
```

#### Windows (CMD/Batch)
```cmd
# Para correções
scripts\release.bat patch

# Para novas funcionalidades
scripts\release.bat minor

# Para mudanças que quebram compatibilidade
scripts\release.bat major
```

### 🔧 **Método 2: Comandos NPM**

```bash
# Para correções
npm run release:patch

# Para novas funcionalidades
npm run release:minor

# Para mudanças que quebram compatibilidade
npm run release:major
```

### 📝 **Método 3: Manual**

#### 1. Preparação
1. Atualize a versão no `package.json`
2. Atualize o `CHANGELOG.md` com as mudanças
3. Faça commit das mudanças: `git add . && git commit -m "feat: nova funcionalidade"`
4. Crie uma tag Git: `git tag v1.1.1`
5. Faça push da tag: `git push origin v1.1.1`

#### 2. Build e Publish
```bash
# Para Windows
npm run publish:win

# Para macOS
npm run publish:mac

# Para Linux
npm run publish:linux
```

### 📋 **O que acontece automaticamente:**

1. **Atualização de versão** no `package.json`
2. **Commit automático** da nova versão
3. **Criação de tag Git** com a versão
4. **Push da tag** para o repositório
5. **Build da aplicação** para a plataforma
6. **Criação de release no GitHub** com:
   - Título: `v1.1.1`
   - Descrição: Conteúdo do `CHANGELOG.md`
   - Arquivos de instalação anexados
7. **Configuração do auto-updater** para usar a nova release

## Configurações Avançadas

### Verificação Manual
```tsx
const { checkForUpdates } = useAutoUpdater()

// Verificar atualizações manualmente
const handleCheckUpdates = async () => {
  await checkForUpdates()
}
```

### Download Manual
```tsx
const { downloadUpdate, isDownloading } = useAutoUpdater()

// Baixar atualização manualmente
const handleDownload = async () => {
  if (!isDownloading) {
    await downloadUpdate()
  }
}
```

### Instalação Manual
```tsx
const { installUpdate, isUpdateDownloaded } = useAutoUpdater()

// Instalar atualização manualmente
const handleInstall = async () => {
  if (isUpdateDownloaded) {
    await installUpdate()
  }
}
```

## Eventos Disponíveis

O auto-updater emite os seguintes eventos:
- `update-available`: Nova versão disponível
- `download-progress`: Progresso do download
- `update-downloaded`: Atualização baixada
- `update-not-available`: Nenhuma atualização disponível
- `error`: Erro durante o processo

## Troubleshooting

### Problemas Comuns

1. **Atualização não detectada**
   - Verifique se a release foi criada corretamente no GitHub
   - Confirme se o `electron-builder.yml` está configurado corretamente
   - Verifique os logs do console

2. **Erro de permissão**
   - Certifique-se de que o app tem permissões para escrever na pasta de instalação
   - Execute como administrador se necessário

3. **Download falha**
   - Verifique a conexão com a internet
   - Confirme se o GitHub está acessível
   - Verifique se há espaço suficiente em disco

### Logs
Os logs do auto-updater são exibidos no console do main process. Para debug, execute:
```bash
npm run dev
```

E observe os logs no terminal.
