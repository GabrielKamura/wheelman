# Wheelman visual style

**In one sentence:** the house look, the same as Kamurafy and Moneysniper: a cartoon notebook, with light paper, thick black ink, a hard offset shadow, gold-yellow highlights and a fox mascot.

Settled on 2026-10-03. The values came from the Kamurafy guide (`docs/design.md` and `ui/css/base.css` in that project), read the same day. There is no dark theme: the house look is light paper, and the popup stays light even when Firefox is in its dark theme.

## What comes from the house and stayed the same

| Piece | Value |
|---|---|
| Ink | `#000` |
| Supporting text | `#374151` |
| Paper (background) | `#fffdf8` |
| Card | `#fff` |
| Neutral area | `#f5f3ee` |
| Gold (highlight) and light gold | `#ffd23f` and `#fff1b8` |
| Pink (mascot's cheek) | `#ff9eb5` |
| Good and critical status | `#0ca30c` on `#dcf5dc`, `#d03b3b` on `#fadcdc` |
| Border | 3 px of ink |
| Shadow | hard, no blur: 4 px (button, card) and 2 px (sticker, small button) |
| Corners | 20 px on the card, 12 px on the notice, 10 px on the sticker, 999 px on buttons and status |
| Button | `.btn`: lifts 2 px on hover, sinks 3 px on click; `.gold`, `.ink` (black with a gold shadow), `.small` |
| Status | `.status`: always icon + text, never color alone |
| Sticker | `.sticker`: gold, tilted 3 degrees, one fact only |
| Icons | 24 grid, 2.3 stroke, round caps, `currentColor` |
| Motion curves | `cubic-bezier(.22, 1, .36, 1)` and the bounce `cubic-bezier(.34, 1.56, .64, 1)` |
| Font | Fredoka, weights 500 and 600. More Sugar is for personal use only and does not go into anything published |

## What is specific to this project

- **The fox** (`extension/icons/wheelman.svg`): front-facing head, gold, 6-in-96 ink outline, ear with a black inner part, white mask, pink cheek, black nose. Gold instead of orange so it does not look like the Firefox fox.
- **The mark on a driven tab** (`LOOK` in `extension/content.js`): a 3 px ink frame with a gold line inside it, and a sticker in the bottom left corner with a green "live" dot and the text saying who is driving, such as "Claude Code is driving this tab" (the name comes from the connected agent; with no name, "AI is driving this tab"). Bottom corner because the top is where sites keep their menu, search and buttons.
- **The click plop**: a gold dot with an ink outline that pops and fades in half a second, at the spot where the agent clicked.
- **Font inside other people's pages**: nothing is downloaded there. It uses the system's rounded typeface (`ui-rounded`, SF Pro Rounded, Arial Rounded MT Bold) and, failing that, the system font. The style is applied directly on the element, with no stylesheet, so it also works on sites with a strict security policy.

## Voice

Plain English (the extension also ships in Brazilian Portuguese), in the tone of a friend who knows the subject: direct, no promising miracles.

- main button: "Pause control", and when paused "Resume control" (pt_BR: "Pausar controle", "Retomar controle")
- each tab in the list: "release" (pt_BR: "soltar")
- empty list: "None right now. Ask your AI for something." (pt_BR: "Nenhuma agora. Peça algo à sua IA.")
- no bridge: "Run the installer in the project folder: node install.js." (pt_BR: "Rode o instalador na pasta do projeto: node install.js.")
- paused: "Paused: no AI can touch Firefox." (pt_BR: "Pausado: nenhuma IA mexe no Firefox.")

## Motion

The card enters with a short bounce when the popup opens, the button lifts and sinks, and the agent's click makes the plop. All of it turns off with "reduce motion".

## Do not

- Orange, terracotta or purple: they recall Mozilla, Anthropic and the rest of the AI extensions.
- Pulsing frames, glow, sparkles, robots.
- A dark theme made by only swapping the background.
- Use More Sugar or the Moneysniper scribble background (it was generated from it).

## Licenses

Fredoka: SIL Open Font License 1.1, text in `extension/fonts/Fredoka-OFL.txt`.
