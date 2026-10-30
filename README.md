# Briefing Africa

Crie uma pagina responsiva com perguntas step-by-step para coleta de briefing para agência de marketing e tráfego pago. cada pergunta deve ser apresentada em uma tela fullscreen, com opcao para resposta com o cursor de teclado puscando suavemente, ao responder pula para próxima pergunta e muda a tela, com animações de transição fluida.

para agência AFRICA e mude a logo em anexo. aplique também o video em anexo como bg em loop com transparencia de 50% e o fundo preto

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://agenciaafrica.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/c8a25841-475d-431c-af85-835653716da0).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Integrações do briefing

O painel administrativo fica em `/painel`. Configure no ambiente do servidor:

- `ADMIN_USER`: `agenciaafrica`
- `ADMIN_PASSWORD`: defina a senha administrativa informada pelo responsável, diretamente como segredo no provedor de hospedagem.
- `ADMIN_SESSION_SECRET`: segredo aleatório forte e permanente (por exemplo, gere com `openssl rand -hex 32`). Ele assina as sessões e deriva a chave AES-GCM que criptografa as credenciais salvas.

As chaves do ElevenLabs e do Gemini são cadastradas no painel e nunca são devolvidas ao navegador. Em Cloudflare Workers, crie um namespace KV e associe-o ao binding `AFRICA_SETTINGS`. Em hospedagem Node/Coolify, monte um volume persistente em `/data` (ou defina `AFRICA_SETTINGS_FILE` para um caminho persistente). Sem um desses armazenamentos, o painel não consegue persistir as chaves.

O ElevenLabs gera uma confirmação falada depois que cada resposta é enviada. A voz aguarda a narração da próxima pergunta terminar. O Gemini interpreta transcrições do reconhecimento de voz e gera a confirmação curta. Sem a chave do Gemini, a confirmação usa uma frase padrão; sem a chave do ElevenLabs, o áudio original das perguntas segue funcionando, sem confirmação falada.
