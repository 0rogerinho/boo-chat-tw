# Exemplos de Releases

Este documento mostra exemplos de como criar releases com diferentes tipos de descrições.

## 📝 **Estrutura do CHANGELOG.md**

O arquivo `CHANGELOG.md` é usado automaticamente como descrição da release. Aqui estão exemplos de como estruturar:

### Exemplo 1: Release de Correção (Patch)
```markdown
## [1.1.1] - 2024-01-15

### Corrigido
- Bug na verificação de atualizações automáticas
- Problema de performance no download de atualizações
- Erro de exibição da barra de progresso

### Melhorado
- Velocidade de verificação de atualizações
- Mensagens de erro mais claras
```

### Exemplo 2: Release de Nova Funcionalidade (Minor)
```markdown
## [1.2.0] - 2024-01-20

### Adicionado
- Notificação de atualização na bandeja do sistema
- Opção para desabilitar verificação automática
- Histórico de versões na interface
- Suporte para atualizações em segundo plano

### Melhorado
- Interface de notificação de atualizações
- Performance do sistema de auto-update
- Experiência do usuário durante atualizações

### Corrigido
- Bug na detecção de versões
- Problema com caracteres especiais no changelog
```

### Exemplo 3: Release Principal (Major)
```markdown
## [2.0.0] - 2024-02-01

### ⚠️ Mudanças que Quebram Compatibilidade
- Nova estrutura de configuração (migração automática)
- API de atualizações reformulada
- Mudança no formato de logs

### Adicionado
- Sistema de rollback para atualizações
- Notificações push para atualizações
- Suporte para canais beta
- Interface de configuração de auto-update

### Melhorado
- Arquitetura do sistema de atualizações
- Segurança das atualizações
- Performance geral do aplicativo

### Removido
- Suporte para versões antigas do Windows
- Configurações legadas de update
```

## 🚀 **Como Criar Releases**

### Método Rápido (Recomendado)
```powershell
# Para uma correção
.\scripts\release.ps1 patch

# Para uma nova funcionalidade
.\scripts\release.ps1 minor

# Para uma mudança principal
.\scripts\release.ps1 major
```

### Método com Descrição Personalizada

1. **Atualize o CHANGELOG.md** com as mudanças
2. **Faça commit das mudanças**:
   ```bash
   git add CHANGELOG.md
   git commit -m "docs: atualizar changelog para v1.1.1"
   ```
3. **Execute o script de release**:
   ```powershell
   .\scripts\release.ps1 patch
   ```

## 📋 **Template de CHANGELOG**

Use este template para suas releases:

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Adicionado
- Nova funcionalidade 1
- Nova funcionalidade 2

### Melhorado
- Melhoria 1
- Melhoria 2

### Corrigido
- Bug fix 1
- Bug fix 2

### Removido
- Funcionalidade removida 1
- Funcionalidade removida 2

### Técnico
- Mudança técnica 1
- Mudança técnica 2
```

## 🎯 **Dicas para Boas Releases**

### 1. **Seja Específico**
❌ Ruim: "Corrigido bugs"
✅ Bom: "Corrigido bug na verificação de atualizações que causava falha em conexões lentas"

### 2. **Use Emojis Moderadamente**
```markdown
### 🐛 Corrigido
- Bug na verificação de atualizações

### ✨ Adicionado
- Nova funcionalidade de notificação
```

### 3. **Agrupe por Categoria**
- **Adicionado**: Novas funcionalidades
- **Melhorado**: Melhorias em funcionalidades existentes
- **Corrigido**: Correções de bugs
- **Removido**: Funcionalidades removidas
- **Técnico**: Mudanças técnicas que não afetam o usuário

### 4. **Mantenha Consistência**
- Use sempre o mesmo formato de data
- Mantenha a mesma estrutura de categorias
- Use linguagem clara e objetiva

## 🔍 **Verificação da Release**

Após criar uma release, verifique:

1. **GitHub Releases**: https://github.com/devrogerinho/boo-chat-tw/releases
2. **Descrição**: Se a descrição do CHANGELOG.md foi aplicada corretamente
3. **Arquivos**: Se os arquivos de instalação foram anexados
4. **Auto-update**: Se o app detecta a nova versão automaticamente
