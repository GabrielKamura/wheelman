# Material for the Firefox store (addons.mozilla.org)

Everything the submission form asks for, ready to paste. The submission itself depends on the owner's Mozilla account. The blocks labelled "Portuguese (pt-BR) listing" are the actual text for the pt-BR listing, so they stay in Portuguese.

## Basics

- **Name:** Wheelman
- **Category:** Web Development (second choice: Tabs)
- **License:** GNU General Public License v3.0
- **Project page and support:** https://github.com/GabrielKamura/wheelman (questions and bugs go to /issues)
- **Screenshots:** `docs/img/driven-tab.jpg` and `docs/img/popup-en.png`

## Summary (up to 250 characters)

**English:** Lets the AI agent on your computer (Claude Code, Codex, Gemini CLI, Cursor...) drive Firefox tabs: open, click, type, read pages and take screenshots. Needs the local bridge from the project page. Unofficial.

**Portuguese (pt-BR) listing:** Deixa a IA do seu computador (Claude Code, Codex, Gemini CLI, Cursor...) dirigir abas do Firefox: abrir, clicar, digitar, ler páginas e tirar print. Precisa da ponte local que está na página do projeto. Não oficial.

## Description

**English**

Wheelman connects Firefox to the AI agent you already use: Claude Code, Codex, Gemini CLI, Cursor or any other MCP client. Once it is installed, the agent can open a tab, go to a page, read it, click, type, fill forms, take screenshots and read the console and network log of that tab, so it can check its own work in a real browser.

How it works: the extension talks to a small program on your computer (a native messaging host), and the agent talks to that program through an MCP server. Nothing goes over the network; the conversation between the agent and Firefox stays on your machine.

You stay in charge:
- The agent only acts in tabs it opened, or in tabs you told it to take over. They sit in an "AI" tab group and wear a black and gold frame with a sticker naming who is driving, such as "Codex is driving this tab".
- The toolbar button lists the tabs under control, releases any of them and has a Pause control button that cuts everything off at once.

Setup: this extension does nothing on its own. Install the bridge from the project page (one command: node install.js) and connect your agent to it (the installer does it for Claude Code; the page shows the one-line command for Codex, Gemini CLI and Cursor).

Limits: Firefox does not give extensions a debugger, so mouse and keyboard are synthetic page events. Native select menus, file pickers, the clipboard and content inside iframes are out of reach. Firefox itself blocks extensions on about: pages, addons.mozilla.org, the PDF viewer and reader view.

Unofficial project. Not made, endorsed or supported by Mozilla or by any AI company. Source code under GPL-3.0.

**Portuguese (pt-BR) listing**

O Wheelman liga o Firefox à IA que você já usa: Claude Code, Codex, Gemini CLI, Cursor ou qualquer outro agente que fale MCP. Com ele instalado, a IA abre uma aba, vai a uma página, lê, clica, digita, preenche formulário, tira print e lê o console e a rede daquela aba, para conferir o próprio trabalho num navegador de verdade.

Como funciona: a extensão conversa com um programa pequeno no seu computador, e a IA conversa com esse programa por um servidor MCP. Nada passa pela rede; a conversa entre a IA e o Firefox fica na sua máquina.

Quem manda é você:
- A IA só age nas abas que ela abriu, ou nas que você mandou assumir. Elas ficam num grupo "IA" e ganham uma moldura preta e amarela com a figurinha de quem está dirigindo, como "Codex está dirigindo esta aba".
- O botão da extensão lista as abas sob controle, solta qualquer uma e tem o Pausar controle, que corta tudo na hora.

Instalação: sozinha, a extensão não faz nada. Instale a ponte pela página do projeto (um comando: node install.js) e ligue a sua IA nela (o instalador faz isso no Claude Code; a página mostra o comando de uma linha para Codex, Gemini CLI e Cursor).

Limites: o Firefox não dá depurador a extensões, então mouse e teclado são eventos sintéticos da página. Menu nativo de lista, seletor de arquivo, área de transferência e conteúdo dentro de iframes ficam de fora. O próprio Firefox bloqueia extensões em páginas about:, em addons.mozilla.org, no leitor de PDF e no modo leitura.

Projeto não oficial. Não é feito, endossado nem suportado pela Mozilla nem por nenhuma empresa de IA. Código aberto sob GPL-3.0.

## Privacy policy

**English**

Wheelman has no server, no account and no analytics. It sends nothing to its author.

When your AI agent asks for it, the extension reads the tabs under its control (the ones the agent opened or you told it to take over): page text and structure, screenshots, the address and title, console messages and the list of network requests. That data goes only to the Wheelman program running on your own computer, which hands it to your agent's session. What the agent does with it, including sending it to its AI provider to get an answer, is governed by that agent's settings and its provider's privacy policy.

Tabs that are not under control are not read. While at least one tab is under control, a tiny script runs at the start of each page in other tabs only to ask the extension whether that tab is controlled; if it is not, the script removes itself without reading anything.

The only thing stored in Firefox is whether control is paused.

**Portuguese (pt-BR) listing**

O Wheelman não tem servidor, conta nem medição de uso. Não manda nada para o autor.

Quando a sua IA pede, a extensão lê as abas sob controle (as que ela abriu ou as que você mandou assumir): texto e estrutura da página, prints, endereço e título, mensagens do console e a lista de requisições de rede. Esses dados vão só para o programa do Wheelman que roda no seu próprio computador, que entrega à sessão da sua IA. O que a IA faz com eles, inclusive enviar à empresa dela para obter a resposta, segue as configurações dessa IA e a política de privacidade da empresa que a oferece.

Abas fora de controle não são lidas. Enquanto houver ao menos uma aba sob controle, um script mínimo roda no começo de cada página das outras abas só para perguntar à extensão se aquela aba é controlada; se não for, ele se desfaz sem ler nada.

A única coisa guardada no Firefox é se o controle está pausado.

## Notes for the reviewer (paste in English)

- The package is the source: plain JavaScript, no build step, no minification, no bundled libraries. Repository: https://github.com/GabrielKamura/wheelman
- The extension needs a native messaging host named `wheelman`. To test: clone the repository, run `node install.js` (copies the bridge to ~/.wheelman and registers the host), then run `npm test`, which drives a real Firefox through every tool. Without the host the popup shows "bridge offline" and the extension is idle.
- `<all_urls>`: the user's agent may be asked to work on any site. Page scripts (`content.js`) are injected only into tabs under control, through `tabs.executeScript`.
- `early.js` is registered with `contentScripts.register` only while at least one tab is under control. It wraps `console` at document start, asks the background whether its tab is controlled and, if not, restores `console` and removes itself. This is needed because a script injected after `webNavigation.onCommitted` misses the page's first console output.
- `webRequest` (non-blocking) lists finished requests of controlled tabs, with one listener per controlled tab.
- `javascript_tool` evaluates code in a controlled tab (`window.eval`, or `tabs.executeScript` with a code string where the page's CSP forbids eval). The code comes from the user's own local AI agent session over native messaging. The extension never downloads or runs code from a server.
- Data collection declared in the manifest: `websiteContent` and `browsingActivity`, for the controlled tabs, transmitted to the local native application only.
- The Fredoka font files are under the SIL Open Font License (extension/fonts/Fredoka-OFL.txt).

## Before submitting

1. Sign in to addons.mozilla.org with the Mozilla account and accept the distribution agreement.
2. Generate the key under Tools › Manage API Keys and paste it into `.amo/credenciais.env`.
3. `npm run sign` signs the current version on the unlisted channel (direct install, not shown in the store).
4. To appear in the store: bump the version in `manifest.json` and submit through the website, on the listed channel, with the texts and screenshots above. The review may question the JavaScript tool; the answer is in the reviewer notes.
