<p align="center">
  <img src="prog.svg" alt="Banner do Projeto" width="200">
  <BR>
 ELOBOT
</p>
O ELOBOT é um chatbot web desenvolvido com HTML, CSS e JavaScript que utiliza a API do CHATGPT OpenAI pela Azure para gerar respostas inteligentes. O projeto possui uma interface simples e intuitiva, permitindo que o usuário converse por texto e utilize recursos de voz por meio do Azure AI Speech. Realizado para requisito de conclusão do curso INTELIGÊNCIAS ARTIFICIAIS GENERATIVAS APLICADA A PROGRAMAÇÃO (CHATGPT).  
<br>

# Funcionalidades
💬 Conversa por texto. <br>
🎙️ Reconhecimento de voz (Speech-to-Text).<br>
🔊 Reprodução em áudio das respostas (Text-to-Speech).<br>
📱 Interface responsiva.<br>
☁️ Integração com Azure OpenAI.<br>
🗣️ Integração com Azure AI Speech.<br>

# Tecnologias utilizadas 
HTML5 <br>
CSS3 <br>
JavaScript <br>
Azure OpenAI API <br>
Azure AI Speech SDK <br>

# Como executar
Clone o repositório <br>
Acesse a pasta do projeto <br>
Crie um arquivo chamado keys.json na raiz do projeto. <br>

# Importante: <br>
O arquivo keys.json está listado no .gitignore para proteger credenciais e evitar que chaves da Azure sejam enviadas ao repositório. 
<br> 
Cada pessoa que utilizar o projeto deverá criar seu próprio arquivo com suas credenciais.

# Exemplo de estrutura: <br>
```
{
  "azure": { 
    "endpoint": "SEU_ENDPOINT", 
    "apiKey": "SUA_CHAVE_OPENAI",
    "model": "SEU_MODELO"
  }, <br>
  "speech": { 
    "key": "SUA_CHAVE_SPEECH",
    "region": "SUA_REGIAO"
  }, 
  "request": {
    "maxCompletionTokens": 4096,
    "reasoningEffort": "medium"
  }, 
  "bot": {
    "name": "ELOBOT", 
    "systemMessage": "Você é o ELOBOT, um chatbot amigável, simples e objetivo."
  } 
} 
```
 # Licença
As chaves de acesso da Azure não devem ser compartilhadas.
<br>
Por esse motivo, o arquivo keys.json não faz parte do repositório e está incluído no .gitignore. <br>
Utilize sempre suas próprias credenciais da Azure OpenAI e do Azure AI Speech. <br>
Este projeto foi desenvolvido para fins de estudo e aprendizado. Caso utilize ou adapte o código, lembre-se de proteger suas credenciais e seguir as boas práticas de segurança da plataforma Azure.
