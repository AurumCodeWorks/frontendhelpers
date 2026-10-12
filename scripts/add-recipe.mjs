// Wire a new CSS effect recipe page into the site.
//   node scripts/add-recipe.mjs <slug> <category-page> [<category-page>…]
// e.g. node scripts/add-recipe.mjs css-loading-spinner css-loading-animations
//
// Reads title, description and read time from <slug>.html, then adds it to
// sitemap.xml, _redirects, llms.txt (CSS effect recipes), the library page's
// "In-depth recipes" cards, each category page's related cards and the
// Guides index. Safe to re-run: anything already present is left alone.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DOMAIN = 'https://frontendhelpers.com';
const [slug, ...categories] = process.argv.slice(2);
if (!slug || !categories.length) {
  console.error('usage: node scripts/add-recipe.mjs <slug> <category-page> [...]');
  process.exit(1);
}
const file = f => join(ROOT, f);
const read = f => readFileSync(file(f), 'utf8');
const write = (f, s) => writeFileSync(file(f), s);
if (!existsSync(file(`${slug}.html`))) throw new Error(`${slug}.html not found`);

const decode = s => s.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const enc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const page = read(`${slug}.html`);
const title = decode(page.match(/<title>([\s\S]*?)<\/title>/)[1]).split(' | ')[0].trim();
const desc = decode(page.match(/<meta name="description" content="([^"]*)"/)[1]);
const mins = page.match(/AurumCodeWorks<\/a> · (\d+) min read/)?.[1] ?? '?';
const url = `${DOMAIN}/${slug}`;
const done = [];

const card = (kicker, cta, indent) => [
  `<a href="/${slug}" class="resource-card">`,
  `  <span class="resource-kicker">${kicker}</span>`,
  `  <h3>${enc(title)}</h3>`,
  `  <p>${enc(desc)}</p>`,
  `  <span class="resource-cta">${cta}</span>`,
  `</a>`].map(l => indent + l).join('\n');

// sitemap.xml
let s = read('sitemap.xml');
if (!s.includes(`<loc>${url}</loc>`)) {
  s = s.replace('</urlset>', `  <url>\n    <loc>${url}</loc>\n    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n</urlset>`);
  write('sitemap.xml', s); done.push('sitemap.xml');
}

// _redirects
s = read('_redirects');
if (!s.includes(`/${slug}.html `)) {
  write('_redirects', s.replace(/\n*$/, `\n/${slug}.html /${slug} 301\n`)); done.push('_redirects');
}

// llms.txt — CSS effect recipes section
s = read('llms.txt');
if (!s.includes(`(${url})`)) {
  s = s.replace('## Guides\n', `- [${title}](${url}): ${desc}\n\n## Guides\n`)
       .replace(/\n\n(- \[[^\n]+\n)\n## Guides/, '\n$1\n## Guides');
  write('llms.txt', s.replace(/\n{3,}/g, '\n\n')); done.push('llms.txt');
}

// Library page — "In-depth recipes" section
s = read('css-animations.html');
if (!s.includes(`href="/${slug}"`)) {
  const at = s.indexOf('<h2>In-depth recipes</h2>');
  const end = s.indexOf('</div>', s.indexOf('<div class="resource-cards">', at));
  s = s.slice(0, end) + card('Recipe', 'Read the recipe →', '        ').trimStart().replace(/^/, '  ') + '\n      ' + s.slice(end);
  write('css-animations.html', s); done.push('css-animations.html');
}

// Category pages — first card under "Related categories"
for (const cat of categories) {
  s = read(`${cat}.html`);
  if (s.includes(`href="/${slug}"`)) continue;
  const at = s.indexOf('<div class="resource-cards">', s.indexOf('Related categories')) + '<div class="resource-cards">'.length;
  const indent = s.slice(at).match(/^\n(\s*)/)[1];
  write(`${cat}.html`, s.slice(0, at) + '\n' + card('Deep dive', 'Read the recipe →', indent) + s.slice(at));
  done.push(`${cat}.html`);
}

// Guides index — after the last card
s = read('guides.html');
if (!s.includes(`href="/${slug}"`)) {
  const cards = [...s.matchAll(/( *)<a href="\/[\w-]+" class="guide-card">[\s\S]*?<\/a>/g)];
  const last = cards[cards.length - 1], ind = last[1];
  const block = [
    `<a href="/${slug}" class="guide-card">`,
    `  <span class="guide-card-meta">CSS recipe · ${mins} min read</span>`,
    `  <h2>${enc(title)}</h2>`,
    `  <p>${enc(desc)}</p>`,
    `  <span class="resource-cta">Read the recipe →</span>`,
    `</a>`].map(l => ind + l).join('\n');
  const pos = last.index + last[0].length;
  write('guides.html', s.slice(0, pos) + '\n' + block + s.slice(pos));
  done.push('guides.html');
}

console.log(`${slug}: ${done.length ? 'updated ' + done.join(', ') : 'already wired'}`);
