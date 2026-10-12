// Pre-deploy quality gate. Errors fail the build; warnings are reported.
//   node scripts/check.mjs [dir]   (defaults to the repo root)
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = process.argv[2]
  ?? fileURLToPath(new URL('..', import.meta.url));
const DOMAIN = 'https://frontendhelpers.com';
const errors = [];
const warnings = [];

const pages = readdirSync(ROOT).filter(f => f.endsWith('.html'));
const slugs = new Set(pages.map(f => f.replace(/\.html$/, '')));
const pathFor = stem => (stem === 'index' ? '/' : `/${stem}`);
const ids = {};
const html = {};
for (const f of pages) {
  html[f] = readFileSync(join(ROOT, f), 'utf8');
  ids[f] = new Set([...html[f].matchAll(/\sid="([^"]+)"/g)].map(m => m[1]));
}

for (const f of pages) {
  const s = html[f];
  const stem = f.replace(/\.html$/, '');
  const isError = stem === '404';

  // Title and description
  const title = s.match(/<title>([\s\S]*?)<\/title>/)?.[1].trim();
  if (!title) errors.push(`${f}: missing <title>`);
  else if (title.length > 70) warnings.push(`${f}: title is ${title.length} chars`);
  if (!isError && !/<meta name="description" content="[^"]+"/.test(s)) errors.push(`${f}: missing meta description`);

  // Exactly one h1
  const h1s = (s.match(/<h1[\s>]/g) || []).length;
  if (h1s !== 1) errors.push(`${f}: ${h1s} <h1> elements`);

  // Canonical must be the clean self URL
  if (!isError) {
    const canon = s.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
    const want = DOMAIN + pathFor(stem);
    if (canon !== want) errors.push(`${f}: canonical is ${canon ?? 'missing'}, expected ${want}`);
  }

  // JSON-LD must parse, and must not reference .html URLs
  for (const [, block] of s.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(block); } catch (e) { errors.push(`${f}: invalid JSON-LD (${e.message})`); }
    if (/frontendhelpers\.com\/[\w-]+\.html/.test(block)) errors.push(`${f}: JSON-LD uses a .html URL`);
  }

  // Internal links: clean URLs only, targets and #anchors must exist
  for (const [, href] of s.matchAll(/href="([^"]*)"/g)) {
    if (/^(https?:|mailto:|tel:|data:)/.test(href) || href === '#' || href === '') continue;
    if (/^[\w-]+\.html/.test(href) || /^\/[\w-]+\.html/.test(href)) {
      errors.push(`${f}: link to legacy URL ${href}`);
      continue;
    }
    const [path, hash] = href.split('#');
    if (!path) { // same-page anchor
      if (hash && !ids[f].has(hash)) errors.push(`${f}: missing anchor #${hash}`);
      continue;
    }
    if (!path.startsWith('/')) continue; // relative asset (style.css etc.)
    const target = path === '/' ? 'index' : path.slice(1);
    if (slugs.has(target)) {
      if (hash && !ids[`${target}.html`].has(hash)) errors.push(`${f}: ${href} → missing anchor`);
    } else if (!existsSync(join(ROOT, path))) {
      errors.push(`${f}: broken link ${href}`);
    }
  }
}

// Sitemap must list every indexable page, with clean URLs
const sitemap = readFileSync(join(ROOT, 'sitemap.xml'), 'utf8');
const locs = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]));
for (const stem of slugs) {
  if (stem === '404') continue;
  if (!locs.has(DOMAIN + pathFor(stem))) errors.push(`sitemap.xml: missing ${pathFor(stem)}`);
}
for (const loc of locs) {
  const stem = loc === `${DOMAIN}/` ? 'index' : loc.replace(`${DOMAIN}/`, '');
  if (!slugs.has(stem)) errors.push(`sitemap.xml: ${loc} has no page`);
}

// Every legacy .html URL should have a permanent redirect
const redirects = readFileSync(join(ROOT, '_redirects'), 'utf8');
for (const stem of slugs) {
  if (stem === '404') continue;
  if (!redirects.includes(`/${stem}.html ${pathFor(stem)} 301`)) errors.push(`_redirects: no 301 for /${stem}.html`);
}

for (const w of warnings) console.log(`warn   ${w}`);
for (const e of errors) console.log(`ERROR  ${e}`);
console.log(`\n${pages.length} pages checked: ${errors.length} errors, ${warnings.length} warnings`);
process.exit(errors.length ? 1 : 0);
