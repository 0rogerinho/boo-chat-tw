# Configuração da API do YouTube

Para que o chat do YouTube funcione corretamente, você precisa configurar uma API key do Google Cloud Console.

## Passo a Passo

### 1. Acesse o Google Cloud Console
- Vá para [console.cloud.google.com](https://console.cloud.google.com/)
- Faça login com sua conta Google

### 2. Crie um Projeto (se não tiver um)
- Clique em "Selecionar um projeto" no topo
- Clique em "Novo Projeto"
- Digite um nome para o projeto (ex: "BooChat YouTube")
- Clique em "Criar"

### 3. Ative a YouTube Data API v3
- No menu lateral, vá em "APIs e Serviços" > "Biblioteca"
- Procure por "YouTube Data API v3"
- Clique na API e depois em "Ativar"

### 4. Crie uma Credencial
- Vá em "APIs e Serviços" > "Credenciais"
- Clique em "Criar Credenciais" > "Chave de API"
- Copie a chave gerada (começa com "AIzaSy...")

### 5. Configure no BooChat
- Abra as configurações do BooChat
- Cole a chave no campo "Chave da API do YouTube"
- Salve as configurações

## Limites da API

- **Quota gratuita**: 10.000 unidades por dia
- **Custo**: Gratuito até o limite diário
- **Rate limit**: 100 requisições por 100 segundos por usuário

## Solução de Problemas

### "API key inválida"
- Verifique se a chave foi copiada corretamente
- Certifique-se de que a YouTube Data API v3 está ativada
- Aguarde alguns minutos após criar a chave

### "Canal não encontrado"
- Verifique se o nome do canal está correto
- Tente usar o handle do canal (ex: @username)
- Certifique-se de que o canal existe e é público

### "Nenhuma transmissão ao vivo encontrada"
- O canal precisa estar transmitindo ao vivo
- Verifique se o chat ao vivo está ativado na transmissão
- Alguns canais podem ter restrições de chat

## Recursos Utilizados

- **Search API**: Para encontrar canais por nome
- **Channels API**: Para obter detalhes do canal
- **Videos API**: Para buscar streams ao vivo
- **Live Chat API**: Para capturar mensagens do chat

## Segurança

- Nunca compartilhe sua API key publicamente
- A chave é armazenada localmente no seu computador
- Você pode revogar a chave a qualquer momento no Google Cloud Console
