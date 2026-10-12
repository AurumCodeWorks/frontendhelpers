// Markdown alternates for AI agents and coding assistants.
// For every built page, writes dist/<slug>.md (the readable content of
// <main>, minus interactive widgets), adds a <link rel="alternate"> to
// the HTML, and concatenates the public pages into dist/llms-full.txt.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { parseHTML } from 'linkedom';
import TurndownService from 'turndown';
import { gfm } from '@joplin/turndown-plugin-gfm';

const DOMAIN = 'https://frontendhelpers.com';
const SKIP = new Set(['404']);
const NOT_IN_FULL = new Set(['privacy-policy', 'cookie-policy', 'terms']);

// Interactive or decorative parts that mean nothing as text
const STRIP = [
  '[hidden]', 'script', 'style', 'noscript', 'svg', 'button', 'input', 'select', 'textarea', 'label',
  '[aria-hidden="true"]', 'nav.breadcrumb', '.tool-card', '.gallery-toolbar', '.anim-pagination',
  '.no-results', '.dir-filter', '.dir-empty', '.learn-demo', '.tip-actions', '.tip-console',
  '.editor-dot', '.hero-points', '.tool-icon', '.output-header', '.modal', '[role="dialog"]',
  '.back-to-hub', '.tools-toolbar', '.dir-count',
];

const td = new TurndownService({
  headingStyle: 'atx', codeBlockStyle: 'fenced', bulletListMarker: '-', emDelimiter: '_',
});
td.use(gfm);

// Turndown gives priority to the rule added LAST, so the generic link
// rule comes first and the component-specific rules follow it.

// Internal links become absolute so the Markdown works out of context
td.addRule('absoluteLinks', {
  filter: node => node.nodeName === 'A' && node.getAttribute('href'),
  replacement: (content, node) => {
    const text = content.trim();
    return text ? `[${text}](${absolute(node.getAttribute('href'))})` : '';
  },
});
// Card components (resource, guide and directory cards) become link lists
td.addRule('cards', {
  filter: node => node.nodeName === 'A' && /\b(resource-card|guide-card|dir-card)\b/.test(node.className || ''),
  replacement: (_, node) => {
    const title = node.querySelector('h2, h3')?.textContent.trim() ?? node.textContent.trim();
    const desc = node.querySelector('p')?.textContent.trim();
    return `\n- [${title}](${absolute(node.getAttribute('href'))})${desc ? `: ${desc}` : ''}\n`;
  },
});
// <details><summary>Q</summary><p>A</p></details> → ### Q + answer
td.addRule('faq', {
  filter: 'summary',
  replacement: content => `\n\n### ${content.trim()}\n\n`,
});
// JS tip cards: heading, explanation, then the snippet (the HTML puts the
// code first, and the snippet has no language class)
td.addRule('tipCard', {
  filter: node => node.nodeName === 'ARTICLE' && /\btip-card\b/.test(node.className || ''),
  replacement: (_, node) => {
    const title = node.querySelector('h3')?.textContent.trim() ?? '';
    const why = td.turndown(node.querySelector('.tip-why')?.innerHTML ?? '');
    const code = node.querySelector('pre')?.textContent.replace(/\n$/, '') ?? '';
    return `\n\n### ${title}\n\n${why}\n\n\`\`\`js\n${code}\n\`\`\`\n\n`;
  },
});

function absolute(href) {
  if (!href || /^(https?:|mailto:)/.test(href)) return href;
  if (href.startsWith('#')) return href;
  return DOMAIN + (href.startsWith('/') ? href : '/' + href);
}

const attr = (doc, sel, name) => doc.querySelector(sel)?.getAttribute(name)?.trim() ?? '';

export function buildMarkdown(OUT, lastmod = {}) {
  const pages = readdirSync(OUT).filter(f => f.endsWith('.html')).map(f => f.slice(0, -5));
  const docs = [];
  for (const slug of pages) {
    if (SKIP.has(slug)) continue;
    const file = join(OUT, `${slug}.html`);
    const html = readFileSync(file, 'utf8');
    const { document } = parseHTML(html);
    const main = document.querySelector('main');
    if (!main) continue;

    const url = attr(document, 'link[rel="canonical"]', 'href');
    const title = (document.querySelector('title')?.textContent ?? '').split(' | ')[0].trim();
    const description = attr(document, 'meta[name="description"]', 'content');
    const isTool = !!document.querySelector('.tool-card');

    for (const sel of STRIP) main.querySelectorAll(sel).forEach(el => el.remove());
    let body = td.turndown(main.innerHTML)
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    if (isTool) body += `\n\n---\n\nThis page is a free interactive tool. Use it in your browser at ${url}`;

    const front = ['---', `title: ${JSON.stringify(title)}`, `description: ${JSON.stringify(description)}`,
      `url: ${url}`, lastmod[url] ? `updated: ${lastmod[url]}` : null, '---'].filter(Boolean).join('\n');
    const md = `${front}\n\n${body}\n`;
    writeFileSync(join(OUT, `${slug}.md`), md);
    docs.push({ slug, url, title, md });

    // Advertise the alternate from the HTML page
    const link = `<link rel="alternate" type="text/markdown" href="/${slug}.md" title="Markdown version" />`;
    writeFileSync(file, html.replace(/(<link rel="canonical"[^>]*>)/, `$1\n  ${link}`));
  }

  // One file with every public page, for agents that want the whole site
  const order = d => (d.slug === 'index' ? 0 : 1);
  const full = docs.filter(d => !NOT_IN_FULL.has(d.slug))
    .sort((a, b) => order(a) - order(b) || a.slug.localeCompare(b.slug))
    .map(d => d.md.replace(/^---[\s\S]*?---\n/, `<!-- ${d.url} -->\n`))
    .join('\n\n---\n\n');
  writeFileSync(join(OUT, 'llms-full.txt'),
    `# FrontendHelpers — full site content\n\n> Every public page of ${DOMAIN} as Markdown, generated at build time. Individual pages are also available at their URL with .md appended.\n\n${full}`);
  return docs.length;
}
