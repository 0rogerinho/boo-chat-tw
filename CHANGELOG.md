# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [1.1.0] - 2024-01-XX

### Adicionado
- Sistema de auto-update integrado com GitHub releases
- Verificação automática de atualizações a cada 4 horas
- Interface de notificação para atualizações disponíveis
- Hook personalizado `useAutoUpdater` para gerenciar atualizações
- Componente `UpdateNotification` para exibir status de atualizações
- Scripts de build e publish para diferentes plataformas
- Documentação completa do sistema de auto-update

### Melhorado
- Configuração do electron-builder para GitHub releases
- Sistema de IPC para comunicação entre main e renderer processes
- Experiência do usuário com notificações de atualização

### Técnico
- Adicionada dependência `electron-updater`
- Configuração de auto-updater no main process
- Handlers IPC para verificar, baixar e instalar atualizações
- APIs expostas no preload para o renderer process
- Configuração otimizada do NSIS para Windows

## [1.0.0] - 2024-01-XX

### Adicionado
- Versão inicial do BooChat
- Suporte para chat do Twitch, Kick e YouTube
- Interface moderna com Tailwind CSS
- Sistema de configuração de canais
- Tray system para Windows
- Atalhos de teclado personalizáveis
