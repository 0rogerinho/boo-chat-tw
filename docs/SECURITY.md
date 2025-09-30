# 🔒 Guia de Segurança - BooChat

## ⚠️ **IMPORTANTE: Segurança de Chaves de API**

### **🚨 NUNCA FAÇA:**
- ❌ Commite chaves de API em texto plano no Git
- ❌ Compartilhe chaves de API publicamente
- ❌ Use a mesma chave em múltiplos projetos
- ❌ Deixe chaves hardcoded sem criptografia

### **✅ SEMPRE FAÇA:**
- ✅ Criptografe chaves antes de commitar
- ✅ Use variáveis de ambiente em produção
- ✅ Monitore o uso das APIs regularmente
- ✅ Revogue chaves comprometidas imediatamente

## 🔐 **Sistema de Criptografia Implementado**

### **Como Funciona:**
1. **Chave Original**: `AIzaSyAXceOGVI1fK-PtSODwJzzPeFxElye_d54`
2. **Criptografia**: AES-256-CBC com IV aleatório
3. **Chave de Criptografia**: `BooChat2024SecretKey!@#$%^&*()_+`
4. **Resultado**: `79a3d2931eabace2017e14cbd9c201d1:2291617ee73002867010dbfe2b8d6b883cce8b2e3a412c6416a5b06119e38ee815d8632db7cffdac0908b4b2b8e0471c`

### **Vantagens:**
- ✅ **Chave não visível** no código compilado
- ✅ **Criptografia robusta** (AES-256-CBC)
- ✅ **IV aleatório** para cada criptografia
- ✅ **Fallback** para chave do usuário

## 🛠️ **Scripts de Criptografia**

### **Gerar Nova Chave Criptografada:**
```bash
node scripts/encrypt-advanced.js "SUA_NOVA_CHAVE_AQUI"
```

### **Testar Criptografia:**
```bash
node scripts/encrypt-advanced.js test
```

## 🔧 **Configuração de Produção**

### **Opção 1: Chave Criptografada (Atual)**
- ✅ Chave fica no código, mas criptografada
- ✅ Usuário pode sobrescrever com sua própria chave
- ⚠️ Chave de criptografia fica no código

### **Opção 2: Variáveis de Ambiente (Recomendado)**
```typescript
// Em produção, use:
const apiKey = process.env.YOUTUBE_API_KEY || decryptApiKey(ENCRYPTED_API_KEY)
```

### **Opção 3: Arquivo de Configuração Externo**
```typescript
// Carregue de um arquivo externo não versionado
const config = require('../config/api-keys.json')
const apiKey = config.youtube.apiKey
```

## 📋 **Checklist de Segurança**

### **Antes do Build:**
- [ ] Chave criptografada no código
- [ ] Chave de criptografia segura
- [ ] Teste de descriptografia funcionando
- [ ] Fallback para chave do usuário

### **Após o Build:**
- [ ] Teste com chave criptografada
- [ ] Teste com chave do usuário
- [ ] Verificar logs de segurança
- [ ] Monitorar uso da API

## 🚨 **Em Caso de Comprometimento**

1. **Revogue a chave** no Google Cloud Console
2. **Gere uma nova chave** de API
3. **Criptografe a nova chave** com o script
4. **Atualize o código** com a nova chave criptografada
5. **Faça novo build** e distribua

## 📊 **Monitoramento**

### **Google Cloud Console:**
- Acesse: https://console.cloud.google.com/
- Vá em "APIs e serviços" → "Painel"
- Monitore uso diário e custos
- Configure alertas de quota

### **Logs do Aplicativo:**
- Monitore tentativas de acesso
- Verifique erros de autenticação
- Acompanhe uso da API

## 🔐 **Melhorias Futuras**

1. **Obfuscação de Código**: Use ferramentas como `javascript-obfuscator`
2. **Chave Dinâmica**: Gere chave de criptografia baseada no hardware
3. **Servidor Proxy**: Use um servidor intermediário para as APIs
4. **Autenticação OAuth**: Implemente fluxo OAuth2 do Google

---

**⚠️ Lembre-se: Nenhum sistema é 100% seguro. A criptografia aqui é para dificultar o acesso casual, não para proteger contra ataques sofisticados.**
