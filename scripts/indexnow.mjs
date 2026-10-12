// Tell IndexNow-enabled search engines (Bing, Yandex, Seznam, Naver…)
// which pages changed in a deploy, so they recrawl in hours, not weeks.
//
//   node scripts/indexnow.mjs <base-sha> <head-sha>   ping changed pages
//   node scripts/indexnow.mjs --all                   ping every sitemap URL
//   add --dry-run to print the URLs without sending
//
// Ownership is proven by the key file at the site root (<key>.txt).
// Never fails the build: problems are reported, exit code stays 0.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const HOST = 'frontendhelpers.com';
const ENDPOINT = 'https://api.indexnow.org/indexnow';
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const shas = args.filter(a => !a.startsWith('--'));

const keyFile = readdirSync(ROOT).find(f => /^[0-9a-f]{32}\.txt$/.test(f));
if (!keyFile) { console.log('indexnow: no key file found, skipping'); process.exit(0); }
const key = keyFile.slice(0, -4);

const sitemapUrls = [...readFileSync(join(ROOT, 'sitemap.xml'), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
const urlFor = file => {
  const stem = file.replace(/\.html$/, '');
  return `https://${HOST}${stem === 'index' ? '/' : `/${stem}`}`;
};

let urls;
if (args.includes('--all')) {
  urls = sitemapUrls;
} else {
  const [base, head] = shas;
  // A brand-new branch push reports an all-zero "before" SHA
  if (!base || !head || /^0+$/.test(base)) { console.log('indexnow: no base commit to diff against, skipping'); process.exit(0); }
  let changed;
  try {
    changed = execFileSync('git', ['diff', '--name-only', base, head], { cwd: ROOT, encoding: 'utf8' }).split('\n');
  } catch (e) {
    console.log(`indexnow: git diff failed (${e.message.split('\n')[0]}), skipping`);
    process.exit(0);
  }
  // Only top-level pages that exist and are in the sitemap (indexable)
  urls = changed
    .filter(f => /^[\w-]+\.html$/.test(f) && existsSync(join(ROOT, f)))
    .map(urlFor)
    .filter(u => sitemapUrls.includes(u));
}

if (!urls.length) { console.log('indexnow: no indexable pages changed'); process.exit(0); }
urls = urls.slice(0, 10000);   // protocol limit per request
console.log(`indexnow: ${urls.length} URL(s)\n  ${urls.join('\n  ')}`);
if (dryRun) process.exit(0);

try {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: HOST, key, keyLocation: `https://${HOST}/${keyFile}`, urlList: urls }),
  });
  // 200 OK and 202 Accepted are both success
  console.log(`indexnow: ${res.status} ${res.statusText}`);
  if (res.status === 403) {
    console.log(`indexnow: key rejected. Check https://${HOST}/${keyFile} is reachable by Bing ` +
      '(Cloudflare Security → Events for blocked Microsoft requests) and the key status in Bing Webmaster Tools → IndexNow.');
  }
} catch (e) {
  console.log(`indexnow: request failed (${e.message})`);
}
