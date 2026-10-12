// Pre-render the animation and JS-tip libraries into static HTML, so
// crawlers that don't run JavaScript (most AI crawlers, and first-pass
// indexing) see the real content, not an empty container.
//
//   node scripts/generate.mjs           rewrite the generated blocks
//   node scripts/generate.mjs --check   exit 1 if any block is stale
//
// The source of truth stays in css-animations.js and js-tips.js. Output
// lives between <!-- generated:NAME --> … <!-- /generated:NAME --> markers.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const CHECK = process.argv.includes('--check');
const read = f => readFileSync(join(ROOT, f), 'utf8');

const esc = s => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Run a page script in a sandbox with its data constants hoisted onto
// the global object. The DOMContentLoaded handler runs until it first
// touches the (absent) DOM and throws — by then the data, declared at
// the top of the handler, has been captured. Demo functions are
// defined but never called.
function extract(file, names) {
  let src = read(file);
  for (const name of names) {
    if (!src.includes(`const ${name} = `)) throw new Error(`${file}: no const ${name}`);
    src = src.replace(`const ${name} = `, `globalThis.${name} = `);
  }
  const sandbox = {
    document: { addEventListener: (_, fn) => { try { fn(); } catch { /* DOM needed past this point */ } } },
    window: {}, navigator: {},
  };
  vm.runInNewContext(src, sandbox);
  for (const name of names) if (!sandbox[name]) throw new Error(`${file}: ${name} not captured`);
  return sandbox;
}

const { CATEGORIES: ANIM_CATS, ANIMATIONS } = extract('css-animations.js', ['CATEGORIES', 'ANIMATIONS']);
const { CATEGORIES: TIP_CATS, LEVELS, TIPS } = extract('js-tips.js', ['CATEGORIES', 'LEVELS', 'TIPS']);

// Category key → its dedicated page
const CAT_PAGES = {
  entrance: 'css-entrance-animations', attention: 'css-attention-animations',
  hover: 'css-hover-effects', loader: 'css-loading-animations',
  text: 'css-text-animations', ambient: 'css-background-animations',
  form: 'css-form-animations', accordion: 'css-accordion-animations',
  image: 'css-image-animations', menu: 'css-menu-animations',
  feedback: 'css-ui-feedback-animations',
};

/* ── Category pages: a full, readable code reference ───────── */
function animReference(cat) {
  const items = ANIMATIONS.filter(a => a.cat === cat);
  const entries = items.map(a => `
      <article class="tool-documentation anim-ref" id="anim-${a.id}">
        <h3>${esc(a.name)}</h3>
        <p>${a.note}</p>
        <p class="anim-ref-label">Markup</p>
        <pre><code class="language-html">${esc(a.usage)}</code></pre>
        <p class="anim-ref-label">CSS</p>
        <pre><code class="language-css">${esc(a.css)}</code></pre>
      </article>`).join('');
  return `
    <section class="gallery-articles anim-reference" aria-labelledby="anim-ref-title">
      <h2 id="anim-ref-title">The code for all ${items.length} ${esc(ANIM_CATS[cat].toLowerCase())}, explained</h2>
      <p class="anim-ref-intro">Every effect above, with the markup to use and the complete CSS. Each one is self-contained: paste the CSS once, add the class, done.</p>${entries}
    </section>
    `;
}

/* ── Library page: a crawlable index of every animation ────── */
function animIndex() {
  const groups = Object.entries(ANIM_CATS).map(([cat, label]) => {
    const links = ANIMATIONS.filter(a => a.cat === cat)
      .map(a => `<li><a href="/${CAT_PAGES[cat]}#anim-${a.id}">${esc(a.name)}</a></li>`).join('');
    return `<div class="anim-index-group"><h3><a href="/${CAT_PAGES[cat]}">${esc(label)}</a></h3><ul>${links}</ul></div>`;
  }).join('\n      ');
  return `
      <div class="anim-index">
      ${groups}
      </div>
    `;
}

/* ── JS tips: static cards (the script rebuilds them on load) ── */
function tipCards() {
  return TIPS.map(t => `
      <article class="tip-card" id="tip-${t.id}">
        <div class="editor-bar">
          <span class="editor-dot red"></span><span class="editor-dot yellow"></span><span class="editor-dot green"></span>
          <span class="editor-file">${esc(t.file)}</span>
          <span class="editor-badges"><span class="tip-cat-tag">${esc(TIP_CATS[t.cat])}</span><span class="level-badge ${t.level}">${esc(LEVELS[t.level])}</span></span>
        </div>
        <pre class="tip-code"><code>${esc(t.code)}</code></pre>
        <div class="tip-body">
          <div class="tip-title-row"><h3>${esc(t.title)}</h3></div>
          <p class="tip-why"><strong>Why pros use it:</strong> ${t.why}</p>
        </div>
      </article>`).join('') + '\n    ';
}

/* ── Changelog page + Atom feed (from changelog.json) ──────── */
const { entries: CHANGES } = JSON.parse(read('changelog.json'));
const SITE = 'https://frontendhelpers.com';
const LABEL = { new: 'New', improved: 'Improved', fixed: 'Fixed' };
const longDate = d => new Date(d + 'T00:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
const entryId = (e, i) => `${e.date}-${CHANGES.length - i}`;

function changelogHtml() {
  return CHANGES.map((e, i) => `
        <section class="changelog-entry" id="${entryId(e, i)}">
          <h2><time datetime="${e.date}">${longDate(e.date)}</time> — ${esc(e.title)}</h2>
          <ul>${e.items.map(it => `
            <li><span class="change-tag change-${it.type}">${LABEL[it.type]}</span> ${it.link ? `<a href="${it.link}">${esc(it.text)}</a>` : esc(it.text)}</li>`).join('')}
          </ul>
        </section>`).join('') + '\n';
}

function changelogAtom() {
  const updated = CHANGES[0].date + 'T00:00:00Z';
  const items = CHANGES.map((e, i) => {
    const list = e.items.map(it => `<li><strong>${LABEL[it.type]}:</strong> ${it.link ? `<a href="${SITE}${it.link}">${esc(it.text)}</a>` : esc(it.text)}</li>`).join('');
    return `  <entry>
    <title>${esc(e.title)}</title>
    <id>${SITE}/changelog#${entryId(e, i)}</id>
    <link href="${SITE}/changelog#${entryId(e, i)}"/>
    <updated>${e.date}T00:00:00Z</updated>
    <content type="html">${esc(`<ul>${list}</ul>`)}</content>
  </entry>`;
  }).join('\n');
  return `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>FrontendHelpers — what's new</title>
  <subtitle>New tools, guides and fixes on FrontendHelpers.</subtitle>
  <id>${SITE}/changelog</id>
  <link href="${SITE}/changelog"/>
  <link rel="self" href="${SITE}/changelog.xml"/>
  <author><name>AurumCodeWorks</name></author>
  <updated>${updated}</updated>
${items}
</feed>
`;
}

/* ── Apply ─────────────────────────────────────────────────── */
const jobs = [
  ...Object.entries(CAT_PAGES).map(([cat, page]) => [`${page}.html`, 'anim-reference', () => animReference(cat)]),
  ['css-animations.html', 'anim-index', animIndex],
  ['js-tips.html', 'tip-cards', tipCards],
  ['changelog.html', 'changelog', changelogHtml],
];

let stale = 0;

// Whole generated files (no markers)
for (const [file, render] of [['changelog.xml', changelogAtom]]) {
  const out = render();
  let src = '';
  try { src = read(file); } catch { /* first run */ }
  if (out === src) continue;
  stale++;
  if (CHECK) console.log(`stale  ${file}`);
  else { writeFileSync(join(ROOT, file), out); console.log(`wrote  ${file}`); }
}

for (const [file, name, render] of jobs) {
  const src = read(file);
  const open = `<!-- generated:${name} -->`, close = `<!-- /generated:${name} -->`;
  const a = src.indexOf(open), b = src.indexOf(close);
  if (a < 0 || b < a) throw new Error(`${file}: missing ${open} markers`);
  const out = src.slice(0, a + open.length) + render() + src.slice(b);
  if (out === src) continue;
  stale++;
  if (CHECK) console.log(`stale  ${file} (${name})`);
  else { writeFileSync(join(ROOT, file), out); console.log(`wrote  ${file} (${name})`); }
}
console.log(CHECK
  ? (stale ? `\n${stale} generated block(s) out of date — run: node scripts/generate.mjs` : 'generated blocks up to date')
  : `${stale} file(s) updated; ${ANIMATIONS.length} animations, ${TIPS.length} tips`);
process.exit(CHECK && stale ? 1 : 0);
