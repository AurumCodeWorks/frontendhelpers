// Build: copy the deployable site into dist/.
// The repo root is the site source; this keeps tooling (scripts/,
// .github/, package.json, README) out of what Cloudflare serves.
import { cpSync, mkdirSync, rmSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildMarkdown } from './markdown.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const OUT = join(ROOT, 'dist');
const EXCLUDE = new Set([
  '.git', '.github', '.gitignore', '.wrangler', 'node_modules',
  'dist', 'scripts', 'package.json', 'package-lock.json', 'README.md',
  'wrangler.jsonc', '.gitattributes',
]);

// Empty dist/ rather than deleting it, so a running `wrangler dev`
// watching the folder doesn't hold a lock that breaks the build
mkdirSync(OUT, { recursive: true });
for (const entry of readdirSync(OUT)) rmSync(join(OUT, entry), { recursive: true, force: true });
let count = 0;
for (const entry of readdirSync(ROOT)) {
  if (EXCLUDE.has(entry)) continue;
  cpSync(join(ROOT, entry), join(OUT, entry), { recursive: true });
  count++;
}
// Markdown alternates + llms-full.txt (dates come from the sitemap)
const sitemap = readFileSync(join(OUT, 'sitemap.xml'), 'utf8');
const lastmod = Object.fromEntries([...sitemap.matchAll(/<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>/g)].map(m => [m[1], m[2]]));
const mdCount = buildMarkdown(OUT, lastmod);
console.log(`Wrote ${mdCount} Markdown alternates + llms-full.txt`);

// Cache-bust CSS/JS: browsers cache them for a day, so every reference
// gets ?v=<content hash>. A changed file gets a new URL; an unchanged
// one keeps its cache.
const assets = readdirSync(OUT).filter(f => /\.(css|js)$/.test(f));
const hashes = Object.fromEntries(assets.map(f => [
  f, createHash('sha256').update(readFileSync(join(OUT, f))).digest('hex').slice(0, 10),
]));
let stamped = 0;
for (const page of readdirSync(OUT).filter(f => f.endsWith('.html'))) {
  const file = join(OUT, page);
  const html = readFileSync(file, 'utf8');
  const out = html.replace(/(href|src)="(\/?)([\w.-]+\.(?:css|js))(?:\?v=[^"]*)?"/g,
    (m, attr, slash, name) => hashes[name] ? `${attr}="${slash}${name}?v=${hashes[name]}"` : m);
  if (out !== html) { writeFileSync(file, out); stamped++; }
}
console.log(`Built dist/ from ${count} top-level entries; versioned assets in ${stamped} pages`);
