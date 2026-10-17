#!/usr/bin/env node
// Renders the docs pages to site/docs/<slug>/index.html from Markdown.
// Reference pages reuse the repository's own sources (the skill references and
// docs/self-hosting.md) so the site never drifts from what agents read.
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, posix } from "node:path";
import { fileURLToPath } from "node:url";
import { Marked, type Tokens } from "marked";

const REPO = fileURLToPath(new URL("../../", import.meta.url));
const OUT = join(REPO, "site/docs");
const BASE = "/live-deck/";
const ORIGIN = "https://projects.angelsirlopu.dev";
const GITHUB = "https://github.com/AngelSirlopuC/live-deck";
const SITE_GITHUB = "https://github.com/AngelSirlopuC/live-deck-site";

/** GitHub URL of a file in this repo or in the live-deck submodule. */
const githubBlob = (path: string) => (path.startsWith("live-deck/") ? `${GITHUB}/blob/main/${path.slice("live-deck/".length)}` : `${SITE_GITHUB}/blob/main/${path}`);

type Source = { file: string; from?: string; to?: string; demote?: boolean; dropTitle?: boolean };

interface Page {
  slug: string;
  title: string;
  description: string;
  group: string;
  sources: Source[];
  /** Lead paragraph shown under the H1 when the source opens without one. */
  lead?: string;
}

const ref = (name: string) => `live-deck/skills/live-deck/references/${name}`;
const own = (name: string) => `site/content/docs/${name}`;

const PAGES: Page[] = [
  { slug: "", title: "Introduction", group: "Start", description: "What Live Deck is and how a live talk works.", sources: [{ file: own("introduction.md") }] },
  { slug: "quick-start", title: "Quick start", group: "Start", description: "Run Live Deck locally, write a deck with Claude and present to phones.", sources: [{ file: own("quick-start.md") }] },
  { slug: "presenting", title: "Presenting", group: "Start", description: "Preview, console, projector screen, phone remote and the audience modes.", sources: [{ file: own("presenting.md") }] },
  { slug: "skill", title: "Claude skill", group: "Authoring", description: "Let Claude write, import and validate decks.", sources: [{ file: own("skill.md") }] },
  {
    slug: "deck-format",
    title: "Deck format",
    group: "Authoring",
    description: "Every field of deck.json format v1: deck, theme, slides and backgrounds.",
    sources: [
      { file: ref("deck-format.md"), to: "## Common element fields" },
      { file: ref("deck-format.md"), from: "## Validation messages" },
    ],
  },
  { slug: "elements", title: "Elements", group: "Authoring", description: "Text, image, shape, qr, icon, chart and decor elements.", lead: "Every element sits in a normalized box on the 16:9 canvas. Seven built-in types exist; free HTML or SVG is not allowed, because deck content reaches audience phones.", sources: [{ file: ref("deck-format.md"), from: "## Common element fields", to: "## Quiz" }] },
  {
    slug: "quizzes",
    title: "Quizzes",
    group: "Authoring",
    description: "Quiz slides, live and secret results, and zone quizzes on designed slides.",
    lead: "A quiz slide asks the room one question with 2–6 options. The player draws the question, the options, the bars and the timer; the correct answer never reaches the audience before you reveal it.",
    sources: [
      { file: ref("deck-format.md"), from: "## Quiz", to: "### Zone quizzes" },
      { file: ref("zone-quizzes.md"), demote: true },
    ],
  },
  { slug: "layouts", title: "Layout recipes", group: "Authoring", description: "Proven boxes and font sizes for common slide types.", sources: [{ file: ref("layout-recipes.md") }] },
  { slug: "themes", title: "Theme presets", group: "Authoring", description: "The six presets and when to use each.", sources: [{ file: ref("themes.md") }] },
  { slug: "cli", title: "CLI", group: "Authoring", description: "Scaffold, import, validate and list decks.", sources: [{ file: own("cli.md") }] },
  { slug: "self-hosting", title: "Self-hosting", group: "Operate", description: "Docker, HTTPS with Caddy, LAN rooms, stickers, privacy and sizing.", sources: [{ file: "live-deck/docs/self-hosting.md" }] },
  { slug: "mcp", title: "Agents and MCP", group: "Operate", description: "Why there is no MCP server today and when one would be justified.", sources: [{ file: ref("mcp.md") }] },
];

/** Repository Markdown files that have a docs page; links to them become page links. */
const PAGE_FOR_FILE: Record<string, string> = {
  [ref("deck-format.md")]: "deck-format",
  [ref("themes.md")]: "themes",
  [ref("zone-quizzes.md")]: "quizzes#zone-quizzes",
  [ref("layout-recipes.md")]: "layouts",
  [ref("mcp.md")]: "mcp",
  "live-deck/docs/self-hosting.md": "self-hosting",
  "live-deck/skills/live-deck/SKILL.md": "skill",
};

const pageUrl = (slug: string) => `${BASE}docs/${slug ? `${slug}/` : ""}`;

function linkTarget(href: string, sourceFile: string): string {
  if (/^(https?:|mailto:|#)/.test(href)) return href;
  if (href.startsWith("/docs/")) return BASE + href.slice(1);
  if (href.startsWith("/")) return href;
  const [path, hash] = href.split("#") as [string, string | undefined];
  const resolved = posix.normalize(posix.join(posix.dirname(sourceFile), path));
  const page = PAGE_FOR_FILE[resolved];
  if (page) {
    const [slug, anchor] = page.split("#") as [string, string | undefined];
    return `${BASE}docs/${slug}/` + (hash ? `#${hash}` : anchor ? `#${anchor}` : "");
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

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/&[a-z]+;/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const escapeHtml = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

function render(page: Page) {
  const toc: { id: string; text: string; depth: number }[] = [];
  const used = new Set<string>();
  let sourceFile = "";
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
        const target = linkTarget(href, sourceFile);
        const external = /^https?:/.test(target) ? ' rel="noopener"' : "";
        return `<a href="${escapeHtml(target)}"${title ? ` title="${escapeHtml(title)}"` : ""}${external}>${this.parser.parseInline(tokens)}</a>`;
      },
      code({ text, lang }: Tokens.Code) {
        const label = (lang || "text").split(/\s/)[0]!;
        let body = escapeHtml(text);
        // Shell comments read as asides: dim them.
        if (label === "sh") body = body.replace(/(^|\s)(#.*)$/gm, '$1<span class="tk-comment">$2</span>');
        return `<figure class="codeblock" data-copy="${escapeHtml(text)}"><figcaption class="legend">${escapeHtml(label)}</figcaption><pre><code>${body}</code></pre></figure>\n`;
      },
      table(token: Tokens.Table) {
        const head = token.header.map((c) => `<th${c.align ? ` style="text-align:${c.align}"` : ""}>${this.parser.parseInline(c.tokens)}</th>`).join("");
        const rows = token.rows.map((r) => `<tr>${r.map((c) => `<td${c.align ? ` style="text-align:${c.align}"` : ""}>${this.parser.parseInline(c.tokens)}</td>`).join("")}</tr>`).join("\n");
        return `<div class="table-wrap"><table><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table></div>\n`;
      },
    },
  });

  const parts = page.sources.map((s) => {
    sourceFile = s.file;
    const md = slice(readFileSync(join(REPO, s.file), "utf8"), s);
    return marked.parse(md, { async: false }) as string;
  });
  let body = parts.join("\n");
  // Every page opens with exactly one H1: the page title.
  body = body.replace(/<h1>.*?<\/h1>\n?/g, "");
  const lead = page.lead && !body.startsWith("<p>") ? `<p>${escapeHtml(page.lead)}</p>\n` : "";
  // Long pages with a single h2 list their h3 sections instead.
  const h2 = toc.filter((t) => t.depth === 2);
  const entries = h2.length >= 2 ? h2 : toc;
  return { body: `<h1>${escapeHtml(page.title)}</h1>\n${lead}${body}`, toc: entries };
}

function sidebar(current: Page) {
  const groups = [...new Set(PAGES.map((p) => p.group))];
  return groups
    .map((g) => {
      const items = PAGES.filter((p) => p.group === g)
        .map((p) => `<li><a href="${pageUrl(p.slug)}"${p === current ? ' aria-current="page"' : ""}>${escapeHtml(p.title)}</a></li>`)
        .join("");
      return `<div class="side-group"><p class="legend">${g}</p><ul>${items}</ul></div>`;
    })
    .join("");
}

function template(page: Page, body: string, toc: { id: string; text: string; depth: number }[]) {
  const i = PAGES.indexOf(page);
  const prev = PAGES[i - 1];
  const next = PAGES[i + 1];
  const title = page.slug ? `${page.title} · Live Deck docs` : "Live Deck docs";
  const url = `${ORIGIN}${pageUrl(page.slug)}`;
  const tocHtml = toc.length > 1 ? `<nav class="toc" aria-label="On this page"><p class="legend">On this page</p><ul>${toc.map((t) => `<li><a href="#${t.id}">${escapeHtml(t.text)}</a></li>`).join("")}</ul></nav>` : "";
  const pager = [
    prev ? `<a class="pager-link" href="${pageUrl(prev.slug)}"><span class="legend">Previous</span><span>${escapeHtml(prev.title)}</span></a>` : "<span></span>",
    next ? `<a class="pager-link pager-next" href="${pageUrl(next.slug)}"><span class="legend">Next</span><span>${escapeHtml(next.title)}</span></a>` : "<span></span>",
  ].join("");
  const source = page.sources[0]!.file;

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="theme-color" content="#14110d" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(page.description)}" />
    <link rel="canonical" href="${url}" />
    <meta property="og:type" content="article" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(page.description)}" />
    <meta property="og:url" content="${url}" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800&family=Oswald:wght@500;600&family=Instrument+Sans:ital,wght@0,400..700;1,400&family=JetBrains+Mono:wght@500;700&display=swap" />
  </head>
  <body class="site docs">
    <a class="skip-link" href="#content">Skip to content</a>
    <header class="topbar">
      <nav class="topbar-inner" aria-label="Main">
        <a class="brand" href="${BASE}" aria-label="Live Deck home"><span class="brand-led" aria-hidden="true"></span>Live Deck</a>
        <button class="key key-sm side-toggle" type="button" aria-expanded="false" aria-controls="sidebar">Menu</button>
        <div class="topbar-links">
          <a class="topbar-link" href="${BASE}docs/" aria-current="page">Docs</a>
          <a class="topbar-link hide-xs" href="${GITHUB}" rel="noopener">GitHub</a>
          <a class="key key-primary key-sm hide-sm" href="${BASE}docs/quick-start/">Get started</a>
        </div>
      </nav>
    </header>
    <div class="docs-shell${tocHtml ? " has-toc" : ""}">
      <aside class="sidebar" id="sidebar" aria-label="Docs">${sidebar(page)}</aside>
      <main class="docs-main" id="content">
        <article class="prose">
${body}
        </article>
        <footer class="docs-foot">
          <nav class="pager" aria-label="Pages">${pager}</nav>
          <p class="edit"><a href="${githubBlob(source)}" rel="noopener">Edit this page on GitHub</a></p>
        </footer>
      </main>
      ${tocHtml}
    </div>
    <script type="module" src="/src/docs.ts"></script>
  </body>
</html>
`;
}

rmSync(OUT, { recursive: true, force: true });
for (const page of PAGES) {
  const { body, toc } = render(page);
  const file = join(OUT, page.slug, "index.html");
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, template(page, body, toc));
}
console.log(`docs: ${PAGES.length} pages → site/docs/`);
