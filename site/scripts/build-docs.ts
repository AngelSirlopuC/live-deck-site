#!/usr/bin/env node
// Renders the docs pages from Markdown, in every locale:
//   en → site/docs/<slug>/index.html, es → site/es/docs/<slug>/index.html
// English reference pages reuse the live-deck submodule's own sources (skill
// references, docs/self-hosting.md) so the site never drifts from what agents
// read. Spanish pages are translations that record the source they came from
// and its hash; the build warns when a source changed after it was translated.
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, posix } from "node:path";
import { fileURLToPath } from "node:url";
import { Marked, type Tokens } from "marked";

const REPO = fileURLToPath(new URL("../../", import.meta.url));
const BASE = "/live-deck/";
const ORIGIN = "https://projects.angelsirlopu.dev";
const GITHUB = "https://github.com/AngelSirlopuC/live-deck";
const SITE_GITHUB = "https://github.com/AngelSirlopuC/live-deck-site";

/** GitHub URL of a file in this repo or in the live-deck submodule. */
const githubBlob = (path: string) => (path.startsWith("live-deck/") ? `${GITHUB}/blob/main/${path.slice("live-deck/".length)}` : `${SITE_GITHUB}/blob/main/${path}`);

type Locale = "en" | "es";

interface LocaleConfig {
  /** Path segment after BASE ("" for English). */
  prefix: string;
  htmlLang: string;
  ogLocale: string;
  /** Label of the language in the switch, and its accessible name. */
  short: string;
  name: string;
  ui: {
    docsTitle: string;
    titleSuffix: string;
    skip: string;
    menu: string;
    docs: string;
    getStarted: string;
    onThisPage: string;
    previous: string;
    next: string;
    edit: string;
    language: string;
    pages: string;
    groups: Record<Group, string>;
  };
}

type Group = "start" | "authoring" | "operate";

const LOCALES: Record<Locale, LocaleConfig> = {
  en: {
    prefix: "",
    htmlLang: "en",
    ogLocale: "en_US",
    short: "EN",
    name: "English",
    ui: {
      docsTitle: "Live Deck docs",
      titleSuffix: "Live Deck docs",
      skip: "Skip to content",
      menu: "Menu",
      docs: "Docs",
      getStarted: "Get started",
      onThisPage: "On this page",
      previous: "Previous",
      next: "Next",
      edit: "Edit this page on GitHub",
      language: "Language",
      pages: "Pages",
      groups: { start: "Start", authoring: "Authoring", operate: "Operate" },
    },
  },
  es: {
    prefix: "es/",
    htmlLang: "es-PE",
    ogLocale: "es_PE",
    short: "ES",
    name: "Español",
    ui: {
      docsTitle: "Docs de Live Deck",
      titleSuffix: "Docs de Live Deck",
      skip: "Saltar al contenido",
      menu: "Menú",
      docs: "Docs",
      getStarted: "Empezar",
      onThisPage: "En esta página",
      previous: "Anterior",
      next: "Siguiente",
      edit: "Editar esta página en GitHub",
      language: "Idioma",
      pages: "Páginas",
      groups: { start: "Empezar", authoring: "Crear decks", operate: "Operar" },
    },
  },
};

type Source = { file: string; from?: string; to?: string; demote?: boolean };

interface PageText {
  title: string;
  description: string;
  sources: Source[];
  /** Lead paragraph shown under the H1 when the source opens without one. */
  lead?: string;
}

interface Page {
  slug: string;
  group: Group;
  text: Record<Locale, PageText>;
}

const ref = (name: string) => `live-deck/skills/live-deck/references/${name}`;
const own = (name: string) => `site/content/docs/${name}`;
const es = (name: string) => `site/content/docs/es/${name}`;

const PAGES: Page[] = [
  {
    slug: "",
    group: "start",
    text: {
      en: { title: "Introduction", description: "What Live Deck is and how a live talk works.", sources: [{ file: own("introduction.md") }] },
      es: { title: "Introducción", description: "Qué es Live Deck y cómo funciona una charla en vivo.", sources: [{ file: es("introduction.md") }] },
    },
  },
  {
    slug: "quick-start",
    group: "start",
    text: {
      en: { title: "Quick start", description: "Run Live Deck locally, write a deck with Claude and present to phones.", sources: [{ file: own("quick-start.md") }] },
      es: { title: "Inicio rápido", description: "Corre Live Deck en tu computadora, crea un deck con Claude y presenta a los celulares.", sources: [{ file: es("quick-start.md") }] },
    },
  },
  {
    slug: "presenting",
    group: "start",
    text: {
      en: { title: "Presenting", description: "Preview, console, projector screen, phone remote and the audience modes.", sources: [{ file: own("presenting.md") }] },
      es: { title: "Presentar", description: "Vista previa, consola, pantalla del proyector, control desde el celular y los modos del público.", sources: [{ file: es("presenting.md") }] },
    },
  },
  {
    slug: "skill",
    group: "authoring",
    text: {
      en: { title: "Claude skill", description: "Let Claude write, import and validate decks.", sources: [{ file: own("skill.md") }] },
      es: { title: "Skill para Claude", description: "Deja que Claude escriba, importe y valide tus decks.", sources: [{ file: es("skill.md") }] },
    },
  },
  {
    slug: "deck-format",
    group: "authoring",
    text: {
      en: {
        title: "Deck format",
        description: "Every field of deck.json format v1: deck, theme, slides and backgrounds.",
        sources: [
          { file: ref("deck-format.md"), to: "## Common element fields" },
          { file: ref("deck-format.md"), from: "## Validation messages" },
        ],
      },
      es: {
        title: "Formato del deck",
        description: "Todos los campos de deck.json formato v1: deck, tema, diapositivas y fondos.",
        sources: [
          { file: es("ref/deck-format.md"), to: "## Campos comunes de los elementos" },
          { file: es("ref/deck-format.md"), from: "## Mensajes de validación" },
        ],
      },
    },
  },
  {
    slug: "elements",
    group: "authoring",
    text: {
      en: {
        title: "Elements",
        description: "Text, image, shape, qr, icon, chart and decor elements.",
        lead: "Every element sits in a normalized box on the 16:9 canvas. Seven built-in types exist; free HTML or SVG is not allowed, because deck content reaches audience phones.",
        sources: [{ file: ref("deck-format.md"), from: "## Common element fields", to: "## Quiz" }],
      },
      es: {
        title: "Elementos",
        description: "Elementos de texto, imagen, forma, qr, ícono, gráfico y decoración.",
        lead: "Cada elemento ocupa una caja normalizada en el lienzo 16:9. Hay siete tipos incorporados; no se permite HTML ni SVG libre, porque el contenido del deck llega a los celulares del público.",
        sources: [{ file: es("ref/deck-format.md"), from: "## Campos comunes de los elementos", to: "## Quiz" }],
      },
    },
  },
  {
    slug: "quizzes",
    group: "authoring",
    text: {
      en: {
        title: "Quizzes",
        description: "Quiz slides, live and secret results, and zone quizzes on designed slides.",
        lead: "A quiz slide asks the room one question with 2–6 options. The player draws the question, the options, the bars and the timer; the correct answer never reaches the audience before you reveal it.",
        sources: [
          { file: ref("deck-format.md"), from: "## Quiz", to: "### Zone quizzes" },
          { file: ref("zone-quizzes.md"), demote: true },
        ],
      },
      es: {
        title: "Quizzes",
        description: "Diapositivas de quiz, resultados en vivo o secretos, y quizzes por zonas en diapositivas diseñadas.",
        lead: "Una diapositiva de quiz le hace al público una pregunta con 2 a 6 opciones. El reproductor dibuja la pregunta, las opciones, las barras y el temporizador; la respuesta correcta nunca llega al público antes de que la reveles.",
        sources: [
          { file: es("ref/deck-format.md"), from: "## Quiz", to: "### Quizzes por zonas" },
          { file: es("ref/zone-quizzes.md"), demote: true },
        ],
      },
    },
  },
  {
    slug: "layouts",
    group: "authoring",
    text: {
      en: { title: "Layout recipes", description: "Proven boxes and font sizes for common slide types.", sources: [{ file: ref("layout-recipes.md") }] },
      es: { title: "Recetas de layout", description: "Cajas y tamaños de fuente probados para los tipos de diapositiva más comunes.", sources: [{ file: es("ref/layout-recipes.md") }] },
    },
  },
  {
    slug: "themes",
    group: "authoring",
    text: {
      en: { title: "Theme presets", description: "The six presets and when to use each.", sources: [{ file: ref("themes.md") }] },
      es: { title: "Presets de tema", description: "Los seis presets y cuándo usar cada uno.", sources: [{ file: es("ref/themes.md") }] },
    },
  },
  {
    slug: "cli",
    group: "authoring",
    text: {
      en: { title: "CLI", description: "Scaffold, import, validate and list decks.", sources: [{ file: own("cli.md") }] },
      es: { title: "CLI", description: "Crea, importa, valida y lista decks.", sources: [{ file: es("cli.md") }] },
    },
  },
  {
    slug: "self-hosting",
    group: "operate",
    text: {
      en: { title: "Self-hosting", description: "Docker, HTTPS with Caddy, LAN rooms, stickers, privacy and sizing.", sources: [{ file: "live-deck/docs/self-hosting.md" }] },
      es: { title: "Autoalojamiento", description: "Docker, HTTPS con Caddy, salas sin internet, stickers, privacidad y capacidad.", sources: [{ file: es("ref/self-hosting.md") }] },
    },
  },
  {
    slug: "mcp",
    group: "operate",
    text: {
      en: { title: "Agents and MCP", description: "Why there is no MCP server today and when one would be justified.", sources: [{ file: ref("mcp.md") }] },
      es: { title: "Agentes y MCP", description: "Por qué hoy no hay servidor MCP y cuándo tendría sentido.", sources: [{ file: es("ref/mcp.md") }] },
    },
  },
];

/** Repository Markdown files that have a docs page; relative links to them become page links. */
const PAGE_FOR_FILE: Record<string, { slug: string; anchor?: Record<Locale, string> }> = {
  [ref("deck-format.md")]: { slug: "deck-format" },
  [ref("themes.md")]: { slug: "themes" },
  [ref("zone-quizzes.md")]: { slug: "quizzes", anchor: { en: "zone-quizzes", es: "quizzes-por-zonas" } },
  [ref("layout-recipes.md")]: { slug: "layouts" },
  [ref("mcp.md")]: { slug: "mcp" },
  "live-deck/docs/self-hosting.md": { slug: "self-hosting" },
  "live-deck/skills/live-deck/SKILL.md": { slug: "skill" },
};

const pageUrl = (slug: string, locale: Locale) => `${BASE}${LOCALES[locale].prefix}docs/${slug ? `${slug}/` : ""}`;

const SOURCE_NOTE = /^<!--\s*source:\s*(\S+)\s+sha256:([0-9a-f]+)\s*-->\s*\n/;
const shortHash = (text: string) => createHash("sha256").update(text).digest("hex").slice(0, 12);

/** Reads a Markdown file; a translation's header names the source its relative links resolve against. */
function readSource(file: string): { md: string; linkBase: string } {
  const raw = readFileSync(join(REPO, file), "utf8");
  const note = SOURCE_NOTE.exec(raw);
  if (!note) return { md: raw, linkBase: file };
  const [, origin, hash] = note as unknown as [string, string, string];
  const current = shortHash(readFileSync(join(REPO, origin), "utf8"));
  if (current !== hash) console.warn(`docs: warning: ${file} was translated from an older ${origin} (sha256 ${hash}, now ${current}); review the translation and update its header`);
  return { md: raw.slice(note[0].length), linkBase: origin };
}

function linkTarget(href: string, linkBase: string, locale: Locale): string {
  if (/^(https?:|mailto:|#)/.test(href)) return href;
  if (href.startsWith("/docs/")) return BASE + LOCALES[locale].prefix + href.slice(1);
  if (href.startsWith("/")) return href;
  const [path, hash] = href.split("#") as [string, string | undefined];
  const resolved = posix.normalize(posix.join(posix.dirname(linkBase), path));
  const page = PAGE_FOR_FILE[resolved];
  if (page) {
    const anchor = hash ?? page.anchor?.[locale];
    return pageUrl(page.slug, locale) + (anchor ? `#${anchor}` : "");
  }
  return `${githubBlob(resolved)}${hash ? `#${hash}` : ""}`;
}

function slice(md: string, s: Source): string {
  let text = md;
  if (s.from) {
    const i = text.indexOf(`\n${s.from}`);
    if (i < 0) throw new Error(`${s.file}: heading not found: ${s.from}`);
    text = text.slice(i + 1);
  }
  if (s.to) {
    const i = text.indexOf(`\n${s.to}`);
    if (i < 0) throw new Error(`${s.file}: heading not found: ${s.to}`);
    text = text.slice(0, i);
  }
  if (s.demote) text = text.replace(/^(#{1,5}) /gm, "#$1 ");
  return text.trim();
}

/** Heading anchors: lowercase ASCII, accents dropped (diseñadas → disenadas). */
const slugify = (s: string) =>
  s
    .replace(/<[^>]+>/g, "")
    .replace(/&[a-z]+;/g, "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const escapeHtml = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

type TocEntry = { id: string; text: string; depth: number };

function render(text: PageText, locale: Locale) {
  const toc: TocEntry[] = [];
  const used = new Set<string>();
  let linkBase = "";
  const marked = new Marked({
    gfm: true,
    renderer: {
      heading({ tokens, depth }: Tokens.Heading) {
        const html = this.parser.parseInline(tokens);
        let id = slugify(html) || "section";
        while (used.has(id)) id += "-2";
        used.add(id);
        if (depth === 1) return `<h1>${html}</h1>\n`;
        if (depth === 2 || depth === 3) toc.push({ id, depth, text: html.replace(/<[^>]+>/g, "") });
        return `<h${depth} id="${id}"><a class="anchor" href="#${id}" aria-hidden="true" tabindex="-1"></a>${html}</h${depth}>\n`;
      },
      link({ href, title, tokens }: Tokens.Link) {
        const target = linkTarget(href, linkBase, locale);
        const external = /^https?:/.test(target) ? ' rel="noopener"' : "";
        return `<a href="${escapeHtml(target)}"${title ? ` title="${escapeHtml(title)}"` : ""}${external}>${this.parser.parseInline(tokens)}</a>`;
      },
      code({ text: code, lang }: Tokens.Code) {
        const label = (lang || "text").split(/\s/)[0]!;
        let body = escapeHtml(code);
        // Shell comments read as asides: dim them.
        if (label === "sh") body = body.replace(/(^|\s)(#.*)$/gm, '$1<span class="tk-comment">$2</span>');
        return `<figure class="codeblock" data-copy="${escapeHtml(code)}"><figcaption class="legend">${escapeHtml(label)}</figcaption><pre><code>${body}</code></pre></figure>\n`;
      },
      table(token: Tokens.Table) {
        const head = token.header.map((c) => `<th${c.align ? ` style="text-align:${c.align}"` : ""}>${this.parser.parseInline(c.tokens)}</th>`).join("");
        const rows = token.rows.map((r) => `<tr>${r.map((c) => `<td${c.align ? ` style="text-align:${c.align}"` : ""}>${this.parser.parseInline(c.tokens)}</td>`).join("")}</tr>`).join("\n");
        return `<div class="table-wrap"><table><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table></div>\n`;
      },
    },
  });

  const parts = text.sources.map((s) => {
    const src = readSource(s.file);
    linkBase = src.linkBase;
    return marked.parse(slice(src.md, s), { async: false }) as string;
  });
  let body = parts.join("\n");
  // Every page opens with exactly one H1: the page title.
  body = body.replace(/<h1>.*?<\/h1>\n?/g, "");
  const lead = text.lead && !body.startsWith("<p>") ? `<p>${escapeHtml(text.lead)}</p>\n` : "";
  // Long pages with a single h2 list their h3 sections instead.
  const h2 = toc.filter((t) => t.depth === 2);
  const entries = h2.length >= 2 ? h2 : toc;
  return { body: `<h1>${escapeHtml(text.title)}</h1>\n${lead}${body}`, toc: entries };
}

function sidebar(current: Page, locale: Locale) {
  const groups = [...new Set(PAGES.map((p) => p.group))];
  return groups
    .map((g) => {
      const items = PAGES.filter((p) => p.group === g)
        .map((p) => `<li><a href="${pageUrl(p.slug, locale)}"${p === current ? ' aria-current="page"' : ""}>${escapeHtml(p.text[locale].title)}</a></li>`)
        .join("");
      return `<div class="side-group"><p class="legend">${LOCALES[locale].ui.groups[g]}</p><ul>${items}</ul></div>`;
    })
    .join("");
}

/** Two-position language switch; each side links to this page in that language. */
function languageSwitch(page: Page, locale: Locale) {
  const keys = (Object.keys(LOCALES) as Locale[])
    .map((l) => {
      const c = LOCALES[l];
      const current = l === locale ? ' aria-current="true"' : "";
      return `<a class="lang-key" href="${pageUrl(page.slug, l)}" hreflang="${c.htmlLang}" lang="${c.htmlLang}" data-lang="${l}"${current} aria-label="${c.name}">${c.short}</a>`;
    })
    .join("");
  return `<nav class="lang-switch" aria-label="${LOCALES[locale].ui.language}">${keys}</nav>`;
}

function template(page: Page, locale: Locale, body: string, toc: TocEntry[]) {
  const cfg = LOCALES[locale];
  const ui = cfg.ui;
  const text = page.text[locale];
  const i = PAGES.indexOf(page);
  const prev = PAGES[i - 1];
  const next = PAGES[i + 1];
  const title = page.slug ? `${text.title} · ${ui.titleSuffix}` : ui.docsTitle;
  const url = `${ORIGIN}${pageUrl(page.slug, locale)}`;
  const alternates = (Object.keys(LOCALES) as Locale[])
    .map((l) => `<link rel="alternate" hreflang="${LOCALES[l].htmlLang}" href="${ORIGIN}${pageUrl(page.slug, l)}" />`)
    .concat(`<link rel="alternate" hreflang="x-default" href="${ORIGIN}${pageUrl(page.slug, "en")}" />`)
    .join("\n    ");
  const tocHtml = toc.length > 1 ? `<nav class="toc" aria-label="${ui.onThisPage}"><p class="legend">${ui.onThisPage}</p><ul>${toc.map((t) => `<li><a href="#${t.id}">${escapeHtml(t.text)}</a></li>`).join("")}</ul></nav>` : "";
  const pager = [
    prev ? `<a class="pager-link" href="${pageUrl(prev.slug, locale)}"><span class="legend">${ui.previous}</span><span>${escapeHtml(prev.text[locale].title)}</span></a>` : "<span></span>",
    next ? `<a class="pager-link pager-next" href="${pageUrl(next.slug, locale)}"><span class="legend">${ui.next}</span><span>${escapeHtml(next.text[locale].title)}</span></a>` : "<span></span>",
  ].join("");
  const source = text.sources[0]!.file;
  const home = `${BASE}${cfg.prefix}`;

  return `<!doctype html>
<html lang="${cfg.htmlLang}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="theme-color" content="#14110d" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(text.description)}" />
    <link rel="canonical" href="${url}" />
    ${alternates}
    <meta property="og:type" content="article" />
    <meta property="og:locale" content="${cfg.ogLocale}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(text.description)}" />
    <meta property="og:url" content="${url}" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800&family=Oswald:wght@500;600&family=Instrument+Sans:ital,wght@0,400..700;1,400&family=JetBrains+Mono:wght@500;700&display=swap" />
  </head>
  <body class="site docs">
    <a class="skip-link" href="#content">${ui.skip}</a>
    <header class="topbar">
      <nav class="topbar-inner" aria-label="Main">
        <a class="brand" href="${home}" aria-label="Live Deck"><span class="brand-led" aria-hidden="true"></span>Live Deck</a>
        <button class="key key-sm side-toggle" type="button" aria-expanded="false" aria-controls="sidebar">${ui.menu}</button>
        <div class="topbar-links">
          <a class="topbar-link" href="${pageUrl("", locale)}" aria-current="page">${ui.docs}</a>
          <a class="topbar-link hide-xs" href="${GITHUB}" rel="noopener">GitHub</a>
          ${languageSwitch(page, locale)}
          <a class="key key-primary key-sm hide-sm" href="${pageUrl("quick-start", locale)}">${ui.getStarted}</a>
        </div>
      </nav>
    </header>
    <div class="docs-shell${tocHtml ? " has-toc" : ""}">
      <aside class="sidebar" id="sidebar" aria-label="${ui.docs}">${sidebar(page, locale)}</aside>
      <main class="docs-main" id="content">
        <article class="prose">
${body}
        </article>
        <footer class="docs-foot">
          <nav class="pager" aria-label="${ui.pages}">${pager}</nav>
          <p class="edit"><a href="${githubBlob(source)}" rel="noopener">${ui.edit}</a></p>
        </footer>
      </main>
      ${tocHtml}
    </div>
    <script type="module" src="/src/docs.ts"></script>
  </body>
</html>
`;
}

let count = 0;
for (const locale of Object.keys(LOCALES) as Locale[]) {
  const out = join(REPO, "site", LOCALES[locale].prefix, "docs");
  rmSync(out, { recursive: true, force: true });
  for (const page of PAGES) {
    const { body, toc } = render(page.text[locale], locale);
    const file = join(out, page.slug, "index.html");
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, template(page, locale, body, toc));
    count++;
  }
}
console.log(`docs: ${count} pages (${Object.keys(LOCALES).join(", ")})`);
