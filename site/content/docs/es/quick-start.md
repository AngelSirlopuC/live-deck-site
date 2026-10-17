<!-- source: site/content/docs/quick-start.md sha256:627d41880e45 -->
# Inicio rápido

Ejecuta Live Deck en tu computadora, escribe un deck con Claude y preséntalo a los celulares conectados al mismo Wi-Fi.

## Requisitos

- Node.js 24 o superior (el servidor ejecuta TypeScript de forma nativa).
- Git.
- Claude Code, si quieres que Claude escriba los decks por ti.

## 1. Obtén el código

```sh
git clone https://github.com/AngelSirlopuC/live-deck.git
cd live-deck
npm install
```

## 2. Inicia los servidores

```sh
npm run dev:server   # API + WebSocket en :8787
npm run dev:web      # Vite en :5180 (hace de proxy para /api, /decks, /ws)
```

Abre `http://localhost:5180`, elige un deck, define un PIN y crea una sesión. La consola se abre con el QR de ingreso en la primera diapositiva.

## 3. Agrega el skill y pide un deck

```sh
npx skills add AngelSirlopuC/live-deck   # instala skills/live-deck
```

Luego pídeselo a Claude, desde la raíz del repositorio:

```text
Crea un live deck sobre la inducción de nuevos colaboradores, con un quiz cada cinco diapositivas.
```

El skill elige un preset de tema, escribe `decks/<id>/deck.json`, lo valida con la CLI y corrige todos los problemas. Al final te da la URL de la vista previa.

## 4. Ingresa desde los celulares

Los celulares conectados al mismo Wi-Fi funcionan de inmediato: cuando la consola corre en `localhost`, los enlaces de ingreso y los códigos QR usan la dirección LAN de esta computadora (el servidor la muestra al iniciar, por ejemplo `http://192.168.1.34:5180`). Si el firewall de tu sistema operativo te pregunta, permite las conexiones entrantes para Node.

Para manejar las diapositivas desde tu celular, presiona **Control móvil** en la consola, escanea el código e ingresa tu PIN.

## Opcional: stickers en el chat

Los stickers del chat necesitan una clave gratuita de la API de GIPHY (developers.giphy.com → Create an API key). Ponla en `.env` (ignorado por git), que `npm run dev:server` carga:

```sh
cp .env.example .env    # luego define GIPHY_API_KEY=...
```

Sin clave, el chat funciona en modo texto y la consola desactiva los modos de stickers.

## Verificaciones

```sh
npm run typecheck
npm test
npm run build
```

Siguiente: [Presentar](/docs/presenting/), o ponlo en un servidor con [Autoalojamiento](/docs/self-hosting/).
