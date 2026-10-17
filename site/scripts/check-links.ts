#!/usr/bin/env node
// Walks dist-site/ and checks that every internal href/src resolves to a built
// file (and every #fragment to an id on that page). Exits 1 on any miss.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const DIST = fileURLToPath(new URL("../../dist-site/", import.meta.url));
const BASE = "/live-deck/";

const pages: string[] = [];
const walk = (dir: string) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (name.endsWith(".html")) pages.push(p);
  }
};
walk(DIST);

const ids = new Map<string, Set<string>>();
const idsOf = (file: string) => {
  if (!ids.has(file)) ids.set(file, new Set([...readFileSync(file, "utf8").matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]!)));
  return ids.get(file)!;
};

function resolveUrl(url: string, from: string): string | null {
  const path = url.startsWith("/") ? url : "/" + relative(DIST, join(from, "..", url)).replaceAll("\\", "/");
  if (!path.startsWith(BASE)) return null;
  let file = join(DIST, path.slice(BASE.length));
  if (path.endsWith("/")) file = join(file, "index.html");
  return file;
}

const problems: string[] = [];
let checked = 0;
for (const page of pages) {
  const html = readFileSync(page, "utf8");
  for (const [, url] of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
    if (/^(https?:|mailto:|data:)/.test(url!)) continue;
    checked++;
    const [path, hash] = url!.split("#") as [string, string | undefined];
    const file = path ? resolveUrl(path, page) : page;
    const where = relative(DIST, page);
    if (!file) problems.push(`${where}: link outside ${BASE}: ${url}`);
    else if (!existsSync(file)) problems.push(`${where}: missing target: ${url}`);
    else if (hash && file.endsWith(".html") && !idsOf(file).has(hash)) problems.push(`${where}: missing anchor: ${url}`);
  }
}

if (problems.length) {
  console.error(problems.join("\n"));
  console.error(`links: ${problems.length} problem(s) in ${checked} links`);
  process.exit(1);
}
console.log(`links: OK (${checked} internal links in ${pages.length} pages)`);
