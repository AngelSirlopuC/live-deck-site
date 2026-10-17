// Builds the public project site (landing + docs) served at
// https://projects.angelsirlopu.dev/live-deck/. The live-deck submodule
// supplies the real renderer, styles and the docs reference sources.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import QRCode from "qrcode";
import { defineConfig, type Plugin } from "vite";
import { publicDeck } from "./live-deck/shared/deck-core.ts";
import { parseDeck } from "./live-deck/shared/deck.ts";

export const SITE_BASE = "/live-deck/";
export const SITE_ORIGIN = "https://projects.angelsirlopu.dev";
const DEMO_DECK = "site-demo";
const DEMO_JOIN_URL = `${SITE_ORIGIN}${SITE_BASE}docs/`;

/**
 * `virtual:demo-deck` exposes the demo deck already reduced to its public
 * projection, so speaker notes and quiz answers never reach the bundle.
 * The answer index is exported separately for the simulated reveal.
 */
function demoDeck(): Plugin {
  const id = "virtual:demo-deck";
  const resolved = "\0" + id;
  const file = resolve("decks", DEMO_DECK, "deck.json");
  return {
    name: "site-demo-deck",
    resolveId: (source) => (source === id ? resolved : null),
    async load(source) {
      if (source !== resolved) return null;
      this.addWatchFile(file);
      const parsed = parseDeck(JSON.parse(readFileSync(file, "utf8")));
      if (!parsed.ok) throw new Error(`decks/${DEMO_DECK}: ${parsed.error}`);
      const answers = Object.fromEntries(parsed.deck.slides.flatMap((s) => (s.quiz ? [[s.id, s.quiz.correctIndex]] : [])));
      const qrSvg = await QRCode.toString(DEMO_JOIN_URL, { type: "svg", margin: 0, errorCorrectionLevel: "M", color: { dark: "#111111", light: "#ffffff" } });
      return [
        `export const deck = ${JSON.stringify(publicDeck(parsed.deck))};`,
        `export const answers = ${JSON.stringify(answers)};`,
        `export const joinUrl = ${JSON.stringify(DEMO_JOIN_URL)};`,
        `export const qrSvg = ${JSON.stringify(qrSvg)};`,
      ].join("\n");
    },
  };
}

/** Every generated HTML page under site/ becomes a build entry. */
function htmlEntries(root: string): Record<string, string> {
  const out: Record<string, string> = {};
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      if (name === "node_modules" || name === "content" || name === "scripts") continue;
      const p = join(dir, name);
      if (statSync(p).isDirectory()) walk(p);
      else if (name.endsWith(".html")) out[relative(root, p).replace(/\.html$/, "").replaceAll("/", "-") || "index"] = p;
    }
  };
  walk(root);
  return out;
}

const root = resolve("site");

export default defineConfig({
  root,
  base: SITE_BASE,
  publicDir: resolve("site/public"),
  plugins: [demoDeck()],
  build: {
    outDir: resolve("dist-site"),
    emptyOutDir: true,
    rollupOptions: { input: htmlEntries(root) },
  },
  server: { port: 5190, strictPort: true },
  preview: { port: 5191, strictPort: true },
});
