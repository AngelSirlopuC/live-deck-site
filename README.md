# Live Deck site

Landing page and docs for [Live Deck](https://github.com/AngelSirlopuC/live-deck), live at
**https://projects.angelsirlopu.dev/live-deck/**.

The site is static. Its hero runs the real Live Deck renderer over a demo deck, and the
docs are generated from the product's own references, so both come from the
[`live-deck`](live-deck) git submodule, pinned to a commit.

## Setup

Requires Node.js 24 or newer.

```sh
git clone --recurse-submodules https://github.com/AngelSirlopuC/live-deck-site.git
cd live-deck-site
npm install
npm run dev        # http://localhost:5190/live-deck/
```

Already cloned without submodules? Run `git submodule update --init`.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Generate the docs pages and start Vite. |
| `npm run build` | Validate the demo deck, generate docs, build to `dist-site/` and check every internal link. |
| `npm run preview` | Serve `dist-site/` on port 5191. |
| `npm run typecheck` | Type-check the site code (and the renderer it imports). |
| `npm run deploy` | Build and rsync `dist-site/` to the VPS. See [deploy/README.md](deploy/README.md). |

## Layout

```
site/index.html          landing page
site/src/                landing and docs scripts and styles
site/content/docs/       docs pages written for the site (Markdown)
site/scripts/            docs generator and link checker
decks/site-demo/         English demo deck shown in the hero
deploy/                  server config (nginx container, Caddy block)
live-deck/               submodule: renderer, styles, skill references
```

Docs pages such as Deck format, Elements, Quizzes, Themes and Self-hosting are rendered from
`live-deck/skills/live-deck/references/` and `live-deck/docs/`. Edit them in the
`live-deck` repository.

## Updating Live Deck

```sh
git -C live-deck fetch && git -C live-deck checkout <commit-or-tag>
npm run build
git add live-deck && git commit -m "chore: bump live-deck"
```

## License

[MIT](LICENSE)
