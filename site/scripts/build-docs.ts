#!/usr/bin/env node
// Renders the docs pages from Markdown, in every locale:
//   en → site/docs/<slug>/index.html, es → site/es/docs/<slug>/index.html
// English reference pages reuse the live-deck submodule's own sources (skill
// references, docs/self-hosting.md) so the site never drifts from what agents
// read. Spanish pages are translations that record the source they came from
// and its hash; the build warns when a source changed after it was translated.
import { execFileSync } from "node:child_process";
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
    main: string;
    breadcrumb: string;
    updated: string;
    by: string;
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
      getStarted: "Quick start",
      onThisPage: "On this page",
      previous: "Previous",
      next: "Next",
      edit: "Edit this page on GitHub",
      language: "Language",
      pages: "Pages",
      main: "Main",
      breadcrumb: "Breadcrumb",
      updated: "Updated",
      by: "by",
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
      getStarted: "Inicio rápido",
      onThisPage: "En esta página",
      previous: "Anterior",
      next: "Siguiente",
      edit: "Editar esta página en GitHub",
      language: "Idioma",
      pages: "Páginas",
      main: "Principal",
      breadcrumb: "Ruta",
      updated: "Actualizado el",
      by: "por",
      groups: { start: "Empezar", authoring: "Crear decks", operate: "Operar" },
    },
  },
};

type Source = { file: string; from?: string; to?: string; demote?: boolean };

interface PageText {
  title: string;
  /** Short sidebar and pager label when the title is long. */
  nav?: string;
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
      en: { title: "Introduction", description: "Live Deck is an open-source live presentation player: slides sync to every phone with quizzes, reactions and chat. See how a live talk works.", sources: [{ file: own("introduction.md") }] },
      es: { title: "Introducción", description: "Live Deck es un reproductor de presentaciones en vivo de código abierto: las diapositivas llegan a cada celular con quizzes, reacciones y chat.", sources: [{ file: es("introduction.md") }] },
    },
  },
  {
    slug: "quick-start",
    group: "start",
    text: {
      en: { title: "Quick start", description: "Install Live Deck with Node.js 24, add the Claude skill, write your first deck and present it to phones on the same Wi-Fi in a few minutes.", sources: [{ file: own("quick-start.md") }] },
      es: { title: "Inicio rápido", description: "Instala Live Deck con Node.js 24, agrega la skill para Claude, crea tu primer deck y preséntalo a los celulares de tu red Wi-Fi en minutos.", sources: [{ file: es("quick-start.md") }] },
    },
  },
  {
    slug: "presenting",
    group: "start",
    text: {
      en: { title: "Presenting", description: "Rehearse in the preview, then run a live session: presenter console, projector screen, phone remote, quizzes, pointer effects and chat.", sources: [{ file: own("presenting.md") }] },
      es: { title: "Presentar", description: "Ensaya en la vista previa y luego presenta en vivo: consola, pantalla del proyector, control desde el celular, quizzes, efectos y chat.", sources: [{ file: es("presenting.md") }] },
    },
  },
  {
    slug: "compare",
    group: "start",
    text: {
      en: { title: "Live Deck vs poll tools and slide frameworks", nav: "Compare", description: "How Live Deck compares with Slido, Mentimeter, AhaSlides, Slidev, Reveal.js and Claper, and when another tool fits better.", sources: [{ file: own("compare.md") }] },
      es: { title: "Live Deck frente a otras herramientas", nav: "Comparar", description: "Cómo se compara Live Deck con Slido, Mentimeter, AhaSlides, Slidev, Reveal.js y Claper, y cuándo te conviene otra herramienta.", sources: [{ file: es("compare.md") }] },
    },
  },
  {
    slug: "skill",
    group: "authoring",
    text: {
      en: { title: "Claude skill", description: "Install the Live Deck skill so Claude writes, imports and validates presentation decks from your outline, notes or slides exported as images.", sources: [{ file: own("skill.md") }] },
      es: { title: "Skill para Claude", description: "Instala la skill de Live Deck para que Claude escriba, importe y valide tus decks desde un esquema, tus notas o diapositivas exportadas.", sources: [{ file: es("skill.md") }] },
    },
  },
  {
    slug: "deck-format",
    group: "authoring",
    text: {
      en: {
        title: "Deck format",
        description: "Reference for the Live Deck deck.json format v1: deck, theme presets, slides, backgrounds and validation messages, with every rule and limit.",
        sources: [
          { file: ref("deck-format.md"), to: "## Common element fields" },
          { file: ref("deck-format.md"), from: "## Validation messages" },
        ],
      },
      es: {
        title: "Formato del deck",
        description: "Referencia del formato deck.json v1 de Live Deck: deck, presets de tema, diapositivas, fondos y mensajes de validación, con cada regla y límite.",
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
        description: "Live Deck slide elements: text, image, shape, join QR, icon, bar and donut charts, and decor, with their boxes, styles and allowed values.",
        lead: "Every element sits in a normalized box on the 16:9 canvas. Seven built-in types exist; free HTML or SVG is not allowed, because deck content reaches audience phones.",
        sources: [{ file: ref("deck-format.md"), from: "## Common element fields", to: "## Quiz" }],
      },
      es: {
        title: "Elementos",
        description: "Elementos de las diapositivas de Live Deck: texto, imagen, forma, QR para unirse, ícono, gráficos y decoración, con sus estilos y valores.",
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
        description: "Add live quizzes to a presentation: live or secret results, timers, rankings, and zone quizzes on slides designed in PowerPoint or Canva.",
        lead: "A quiz slide asks the room one question with 2–6 options. The player draws the question, the options, the bars and the timer; the correct answer never reaches the audience before you reveal it.",
        sources: [
          { file: ref("deck-format.md"), from: "## Quiz", to: "### Zone quizzes" },
          { file: ref("zone-quizzes.md"), demote: true },
        ],
      },
      es: {
        title: "Quizzes",
        description: "Agrega quizzes en vivo a tu presentación: resultados en vivo o secretos, temporizador, ranking y quizzes por zonas en diapositivas diseñadas.",
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
      en: { title: "Layout recipes", description: "Copy-ready layout recipes for Live Deck slides: title with QR, bullets, two columns, big numbers, charts, quotes and imported slides.", sources: [{ file: ref("layout-recipes.md") }] },
      es: { title: "Recetas de layout", description: "Recetas de layout listas para copiar en Live Deck: portada con QR, viñetas, dos columnas, números grandes, gráficos, citas y diapositivas importadas.", sources: [{ file: es("ref/layout-recipes.md") }] },
    },
  },
  {
    slug: "themes",
    group: "authoring",
    text: {
      en: { title: "Theme presets", description: "The six Live Deck theme presets (estudio, editorial, neon, papel, brutalista, corporativo) and how to pick one for your topic and room.", sources: [{ file: ref("themes.md") }] },
      es: { title: "Presets de tema", description: "Los seis presets de tema de Live Deck (estudio, editorial, neon, papel, brutalista, corporativo) y cómo elegir uno según tu tema y tu sala.", sources: [{ file: es("ref/themes.md") }] },
    },
  },
  {
    slug: "cli",
    group: "authoring",
    text: {
      en: { title: "CLI", description: "The live-deck CLI: scaffold a deck, import slides exported as images, validate deck.json with exact error paths and list your decks.", sources: [{ file: own("cli.md") }] },
      es: { title: "CLI", description: "La CLI live-deck: crea la estructura de un deck, importa diapositivas exportadas como imágenes, valida deck.json y lista tus decks.", sources: [{ file: es("cli.md") }] },
    },
  },
  {
    slug: "self-hosting",
    group: "operate",
    text: {
      en: { title: "Self-hosting", description: "Self-host Live Deck with Docker: HTTPS with Caddy, rooms without internet, GIPHY stickers, privacy and how many attendees one server handles.", sources: [{ file: "live-deck/docs/self-hosting.md" }] },
      es: { title: "Autoalojamiento", description: "Aloja Live Deck en tu servidor con Docker: HTTPS con Caddy, salas sin internet, stickers de GIPHY, privacidad y capacidad por sesión.", sources: [{ file: es("ref/self-hosting.md") }] },
    },
  },
  {
    slug: "mcp",
    group: "operate",
    text: {
      en: { title: "Agents and MCP", description: "Why Live Deck ships no MCP server: agents write deck files and validate them with the CLI. When a server would make sense and what it would expose.", sources: [{ file: ref("mcp.md") }] },
      es: { title: "Agentes y MCP", description: "Por qué Live Deck no incluye servidor MCP: los agentes escriben archivos y los validan con la CLI. Cuándo tendría sentido uno y qué expondría.", sources: [{ file: es("ref/mcp.md") }] },
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
        .map((p) => `<li><a href="${pageUrl(p.slug, locale)}"${p === current ? ' aria-current="page"' : ""}>${escapeHtml(navLabel(p.text[locale]))}</a></li>`)
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

/** Last commit date (YYYY-MM-DD) of a file in this repo or the live-deck submodule; today when uncommitted. */
const dateCache = new Map<string, string>();
function gitDate(file: string): string {
  if (!dateCache.has(file)) {
    const [cwd, path] = file.startsWith("live-deck/") ? [join(REPO, "live-deck"), file.slice("live-deck/".length)] : [REPO, file];
    let date = "";
    try {
      date = execFileSync("git", ["log", "-1", "--format=%cs", "--", path], { cwd, encoding: "utf8" }).trim();
    } catch {
      /* not a git checkout: fall back to today */
    }
    dateCache.set(file, date || new Date().toISOString().slice(0, 10));
  }
  return dateCache.get(file)!;
}

/** Newest date among a page's sources (and, for a translation, its English origin). */
function pageDate(text: PageText): string {
  const files = text.sources.flatMap((s) => {
    const note = SOURCE_NOTE.exec(readFileSync(join(REPO, s.file), "utf8"));
    return note ? [s.file, note[1]!] : [s.file];
  });
  return files.map(gitDate).sort().at(-1)!;
}

const navLabel = (text: PageText) => text.nav ?? text.title;
const AUTHOR = { "@type": "Person", "@id": "https://github.com/AngelSirlopuC#person", name: "Angel Sirlopu", url: "https://github.com/AngelSirlopuC" };
const OG_IMAGE: Record<Locale, string> = { en: `${ORIGIN}${BASE}og.png`, es: `${ORIGIN}${BASE}og-es.png` };

function jsonLd(page: Page, locale: Locale, modified: string): string {
  const cfg = LOCALES[locale];
  const text = page.text[locale];
  const url = `${ORIGIN}${pageUrl(page.slug, locale)}`;
  const crumbs = [
    { name: "Live Deck", item: `${ORIGIN}${BASE}${cfg.prefix}` },
    { name: cfg.ui.docs, item: `${ORIGIN}${pageUrl("", locale)}` },
    ...(page.slug ? [{ name: navLabel(text) }] : []),
  ];
  const graph = [
    {
      "@type": "TechArticle",
      "@id": `${url}#article`,
      headline: text.title,
      description: text.description,
      url,
      mainEntityOfPage: url,
      inLanguage: cfg.htmlLang,
      dateModified: modified,
      image: OG_IMAGE[locale],
      isPartOf: { "@id": `${ORIGIN}${BASE}#website` },
      about: { "@id": `${ORIGIN}${BASE}#software` },
      author: { "@id": AUTHOR["@id"] },
      publisher: { "@id": AUTHOR["@id"] },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, ...("item" in c ? { item: c.item } : {}) })),
    },
    AUTHOR,
  ];
  // "<" is escaped so no string in the data can close the script element.
  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c");
}

function template(page: Page, locale: Locale, body: string, toc: TocEntry[]) {
  const cfg = LOCALES[locale];
  const ui = cfg.ui;
  const text = page.text[locale];
  const i = PAGES.indexOf(page);
  const prev = PAGES[i - 1];
  const next = PAGES[i + 1];
  const title = `${text.title} · ${ui.titleSuffix}`;
  const url = `${ORIGIN}${pageUrl(page.slug, locale)}`;
  const modified = pageDate(text);
  const alternates = (Object.keys(LOCALES) as Locale[])
    .flatMap((l) => (l === "es" ? [LOCALES[l].htmlLang, "es"] : [LOCALES[l].htmlLang]).map((code) => `<link rel="alternate" hreflang="${code}" href="${ORIGIN}${pageUrl(page.slug, l)}" />`))
    .concat(`<link rel="alternate" hreflang="x-default" href="${ORIGIN}${pageUrl(page.slug, "en")}" />`)
    .join("\n    ");
  const tocHtml = toc.length > 1 ? `<nav class="toc" aria-label="${ui.onThisPage}"><p class="legend">${ui.onThisPage}</p><ul>${toc.map((t) => `<li><a href="#${t.id}">${escapeHtml(t.text)}</a></li>`).join("")}</ul></nav>` : "";
  const pager = [
    prev ? `<a class="pager-link" href="${pageUrl(prev.slug, locale)}"><span class="legend">${ui.previous}</span><span>${escapeHtml(navLabel(prev.text[locale]))}</span></a>` : "<span></span>",
    next ? `<a class="pager-link pager-next" href="${pageUrl(next.slug, locale)}"><span class="legend">${ui.next}</span><span>${escapeHtml(navLabel(next.text[locale]))}</span></a>` : "<span></span>",
  ].join("");
  const crumbs = page.slug
    ? `<nav class="crumbs" aria-label="${ui.breadcrumb}"><a href="${BASE}${cfg.prefix}">Live Deck</a><span aria-hidden="true">/</span><a href="${pageUrl("", locale)}">${ui.docs}</a><span aria-hidden="true">/</span><span aria-current="page">${escapeHtml(navLabel(text))}</span></nav>`
    : `<nav class="crumbs" aria-label="${ui.breadcrumb}"><a href="${BASE}${cfg.prefix}">Live Deck</a><span aria-hidden="true">/</span><span aria-current="page">${ui.docs}</span></nav>`;
  const source = text.sources[0]!.file;
  const home = `${BASE}${cfg.prefix}`;
  const shortTitle = escapeHtml(title);

  return `<!doctype html>
<html lang="${cfg.htmlLang}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="theme-color" content="#14110d" />
    <title>${shortTitle}</title>
    <meta name="description" content="${escapeHtml(text.description)}" />
    <meta name="author" content="Angel Sirlopu" />
    <link rel="canonical" href="${url}" />
    ${alternates}
    <link rel="alternate" type="text/markdown" href="${pageUrl(page.slug, locale)}index.md" title="Markdown" />
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="Live Deck" />
    <meta property="og:locale" content="${cfg.ogLocale}" />
    <meta property="og:title" content="${shortTitle}" />
    <meta property="og:description" content="${escapeHtml(text.description)}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${OG_IMAGE[locale]}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="article:modified_time" content="${modified}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:image" content="${OG_IMAGE[locale]}" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="preload" href="/fonts/bricolage-grotesque-normal-500-800.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="preload" href="/fonts/instrument-sans-normal-400-700.woff2" as="font" type="font/woff2" crossorigin />
    <script type="application/ld+json">${jsonLd(page, locale, modified)}</script>
  </head>
  <body class="site docs">
    <a class="skip-link" href="#content">${ui.skip}</a>
    <header class="topbar">
      <nav class="topbar-inner" aria-label="${ui.main}">
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
        ${crumbs}
        <article class="prose">
${body}
        </article>
        <footer class="docs-foot">
          <nav class="pager" aria-label="${ui.pages}">${pager}</nav>
          <p class="edit">${ui.updated} <time datetime="${modified}">${modified}</time> · ${ui.by} <a href="https://github.com/AngelSirlopuC" rel="author noopener">Angel Sirlopu</a> · <a href="${githubBlob(source)}" rel="noopener">${ui.edit}</a></p>
        </footer>
      </main>
      ${tocHtml}
    </div>
    <script type="module" src="/src/docs.ts"></script>
  </body>
</html>
`;
}

/** The page's Markdown with absolute links, served next to it as index.md for agents. */
function markdown(page: Page, locale: Locale): string {
  const text = page.text[locale];
  const parts = text.sources.map((s) => {
    const src = readSource(s.file);
    return slice(src.md, s).replace(/\]\(([^)\s]+)\)/g, (_, href: string) => {
      const target = linkTarget(href, src.linkBase, locale);
      return `](${target.startsWith("/") ? ORIGIN + target : target})`;
    });
  });
  const body = parts.join("\n\n").replace(/^# .*\n+/m, "");
  return `# ${text.title}\n\n> ${text.description}\n\n${body}\n`;
}

function sitemap(): string {
  const locales = Object.keys(LOCALES) as Locale[];
  const entry = (urls: Record<Locale, string>, lastmod: string) =>
    locales
      .map((l) => {
        const links = locales
          .flatMap((a) => (a === "es" ? [LOCALES[a].htmlLang, "es"] : [LOCALES[a].htmlLang]).map((code) => `    <xhtml:link rel="alternate" hreflang="${code}" href="${urls[a]}"/>`))
          .concat(`    <xhtml:link rel="alternate" hreflang="x-default" href="${urls.en}"/>`)
          .join("\n");
        return `  <url>\n    <loc>${urls[l]}</loc>\n    <lastmod>${lastmod}</lastmod>\n${links}\n  </url>`;
      })
      .join("\n");
  const landingDate = ["site/index.html", "site/es/index.html", "site/src/landing.ts"].map(gitDate).sort().at(-1)!;
  const landing = entry({ en: `${ORIGIN}${BASE}`, es: `${ORIGIN}${BASE}es/` }, landingDate);
  const docs = PAGES.map((p) => {
    const dates = locales.map((l) => pageDate(p.text[l])).sort();
    return entry({ en: `${ORIGIN}${pageUrl(p.slug, "en")}`, es: `${ORIGIN}${pageUrl(p.slug, "es")}` }, dates.at(-1)!);
  });
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${[landing, ...docs].join("\n")}\n</urlset>\n`;
}

function llmsTxt(): string {
  const link = (p: Page, l: Locale) => `- [${p.text[l].title}](${ORIGIN}${pageUrl(p.slug, l)}index.md): ${p.text[l].description}`;
  return `# Live Deck

> Live Deck is an open-source (MIT), self-hosted, live two-way presentation player. The presenter drives slides from a console; the audience follows on their phones in the browser (no app), answers quizzes, reacts and chats. Decks are JSON files, usually written by Claude with a skill installed via \`npx skills add AngelSirlopuC/live-deck\`.

Unlike poll tools that run beside the slides, in Live Deck the slides themselves are the live surface. Sessions are held in memory and deleted when they end. Every docs page below is linked as Markdown; the HTML page is the same URL without \`index.md\`.

## Docs
${PAGES.map((p) => link(p, "en")).join("\n")}

## Optional
- [Documentación en español](${ORIGIN}${pageUrl("", "es")}index.md): the same docs in Spanish (Peru)
- [Source code](${GITHUB}): the Live Deck repository
- [Site source](${SITE_GITHUB}): this website
`;
}

const extrasDir = process.argv.includes("--extras") ? process.argv[process.argv.indexOf("--extras") + 1] : null;

if (extrasDir) {
  // After the Vite build: Markdown siblings, sitemap and llms.txt go into the output.
  const out = join(REPO, extrasDir);
  for (const locale of Object.keys(LOCALES) as Locale[]) {
    for (const page of PAGES) {
      const file = join(out, LOCALES[locale].prefix, "docs", page.slug, "index.md");
      mkdirSync(dirname(file), { recursive: true });
      writeFileSync(file, markdown(page, locale));
    }
  }
  writeFileSync(join(out, "sitemap.xml"), sitemap());
  writeFileSync(join(out, "llms.txt"), llmsTxt());
  console.log(`docs: extras → ${extrasDir} (${PAGES.length * 2} Markdown pages, sitemap.xml, llms.txt)`);
} else {
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
}
