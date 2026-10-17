# Quick start

Run Live Deck locally, write a deck with Claude and present it to phones on the same Wi-Fi.

## Requirements

- Node.js 24 or newer (the server runs TypeScript natively).
- Git.
- Claude Code, if you want Claude to write decks for you.

## 1. Get the code

```sh
git clone https://github.com/AngelSirlopuC/live-deck.git
cd live-deck
npm install
```

## 2. Start the servers

```sh
npm run dev:server   # API + WebSocket on :8787
npm run dev:web      # Vite on :5180 (proxies /api, /decks, /ws)
```

Open `http://localhost:5180`, pick a deck, set a PIN and create a session. The console opens with the join QR on the first slide.

## 3. Add the skill and ask for a deck

```sh
npx skills add AngelSirlopuC/live-deck   # installs skills/live-deck
```

Then ask Claude, from the repository root:

```text
Create a live deck about onboarding new hires, with one quiz every five slides.
```

The skill picks a theme preset, writes `decks/<id>/deck.json`, validates it with the CLI and fixes every issue. It ends by giving you the preview URL.

## 4. Join from phones

Phones on the same Wi-Fi work out of the box: when the console runs on `localhost`, join links and QR codes use this machine's LAN address (the server prints it on start, for example `http://192.168.1.34:5180`). If your OS firewall asks, allow incoming connections for Node.

To drive the slides from your phone, press **Control móvil** in the console, scan the code and enter your PIN.

## Optional: chat stickers

Chat stickers need a free GIPHY API key (developers.giphy.com → Create an API key). Put it in `.env` (git-ignored), which `npm run dev:server` loads:

```sh
cp .env.example .env    # then set GIPHY_API_KEY=...
```

Without a key, chat works in text mode and the console disables sticker modes.

## Checks

```sh
npm run typecheck
npm test
npm run build
```

Next: [Presenting](/docs/presenting/), or put it on a server with [Self-hosting](/docs/self-hosting/).
