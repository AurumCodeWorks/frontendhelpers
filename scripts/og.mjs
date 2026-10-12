// Render 1200×630 Open Graph images in the site's house style.
//   node scripts/og.mjs            render every image in IMAGES
//   node scripts/og.mjs <name>     render one (e.g. og-clamp-generator)
// Uses a locally installed Chrome or Edge in headless mode; output goes
// to assets/<name>.png and is committed like any other image.
import { writeFileSync, mkdtempSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

// [first line, highlighted second line, [[bold, dim] pills]]
const IMAGES = {
  'og-clamp-generator': ['CSS clamp()', 'generator', [['Fluid', 'type scale'], ['rem + vw', 'output'], ['WCAG', 'zoom check']]],
  'og-fluid-typography-clamp-guide': ['Fluid typography', 'with clamp()', [['Worked', 'maths'], ['200%', 'zoom tested'], ['Guide', '8 min']]],
  'og-wcag-colour-contrast-guide': ['WCAG 2.2', 'colour contrast', [['4.5:1', '& 3:1'], ['17 pairs', 'tested'], ['Guide', '9 min']]],
  'og-robots-txt-vs-noindex-vs-canonical': ['robots.txt vs noindex', 'vs canonical', [['Crawl', 'vs index'], ['Decision', 'table'], ['Guide', '7 min']]],
  'og-css-typewriter-effect': ['CSS typewriter', 'effect', [['steps()', '+ ch'], ['3', 'live demos'], ['Recipe', '7 min']]],
  'og-css-skeleton-loader': ['Skeleton loading', 'screens in CSS', [['Shimmer', 'on the compositor'], ['Accessible', 'loading'], ['Recipe', '7 min']]],
  'og-css-animated-gradient-border': ['Animated gradient', 'borders', [['3', 'techniques'], ['@property', 'animation'], ['Recipe', '7 min']]],
  'og-css-loading-spinner': ['CSS loading', 'spinners', [['3', 'techniques'], ['Accessible', 'status'], ['Recipe', '7 min']]],
  'og-css-fade-in-on-scroll': ['Fade in on scroll', 'with pure CSS', [['view()', 'timelines'], ['JS', 'fallback'], ['Recipe', '7 min']]],
  'og-css-animated-gradient-text': ['Animated', 'gradient text', [['background-clip', 'text'], ['Contrast', 'checked'], ['Recipe', '7 min']]],
  'og-css-marquee-animation': ['CSS marquee', 'done right', [['Seamless', 'loop'], ['Pause', 'control'], ['Recipe', '7 min']]],
  'og-css-hover-underline-animation': ['Hover underline', 'animations', [['Survives', 'line wraps'], ['Focus', 'too'], ['Recipe', '7 min']]],
  'og-css-flip-card': ['CSS 3D', 'flip card', [['Hover, focus', '& click'], ['inert', 'back face'], ['Recipe', '7 min']]],
  'og-css-accordion-animation': ['Animate to', 'height: auto', [['interpolate-size', ''], ['details', 'native'], ['Recipe', '7 min']]],
  'og-css-dialog-animation': ['Animate a', 'native dialog', [['@starting-style', ''], ['allow-discrete', 'exit'], ['Recipe', '7 min']]],
  'og-changelog': ["What's new on", 'FrontendHelpers', [['New', 'tools'], ['New', 'guides'], ['Every', 'fix listed']]],
  'og-css-shake-animation': ['CSS shake', 'animation', [['Accessible', 'errors'], ['Reduced', 'motion'], ['Recipe', '7 min']]],
};

const BROWSERS = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
];
const browser = BROWSERS.find(existsSync);
if (!browser) throw new Error('No Chrome or Edge found for headless rendering');

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const font = w => pathToFileURL(join(ROOT, `fonts/outfit-v1-latin-${w}.woff2`)).href;
const body = pathToFileURL(join(ROOT, 'fonts/plus-jakarta-sans-v1-latin-600.woff2')).href;

function page([line1, line2, pills]) {
  return `<!doctype html><meta charset="utf-8"><style>
  @font-face { font-family: Outfit; font-weight: 700; src: url(${font(700)}); }
  @font-face { font-family: Outfit; font-weight: 600; src: url(${font(600)}); }
  @font-face { font-family: Jakarta; font-weight: 600; src: url(${body}); }
  * { margin: 0; box-sizing: border-box; }
  html, body { width: 1200px; height: 630px; overflow: hidden; }
  body {
    background:
      radial-gradient(520px 420px at 1080px 60px, rgba(124, 58, 237, .32), transparent 70%),
      radial-gradient(480px 380px at 40px 600px, rgba(6, 182, 212, .16), transparent 70%),
      linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px) 0 0 / 60px 60px,
      linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px) 0 0 / 60px 60px,
      #05070f;
    color: #f1f5f9; font-family: Outfit, sans-serif; padding: 145px 90px 0;
    position: relative;
  }
  .logo { display: flex; align-items: center; gap: 22px; font-size: 40px; font-weight: 600; letter-spacing: -.5px; }
  .logo svg { width: 70px; height: 40px; }
  .grad { background: linear-gradient(90deg, #6d6af7, #22b8d8); -webkit-background-clip: text; color: transparent; }
  .helpers { color: #19b6d2; }
  h1 { margin-top: 50px; font-size: 76px; line-height: 1.02; font-weight: 700; letter-spacing: -1.5px; }
  .pills { display: flex; gap: 16px; margin-top: 34px; }
  .pill { font-family: Jakarta, sans-serif; font-size: 22px; padding: 16px 26px; border-radius: 999px;
    border: 1.5px solid rgba(148,163,184,.35); background: rgba(15,23,42,.6); color: #94a3b8; }
  .pill b { color: #f8fafc; font-weight: 600; }
  .domain { position: absolute; right: 90px; bottom: 44px; font-family: Jakarta, sans-serif; font-size: 25px; color: #7c8db5; }
  </style>
  <div class="logo"><svg viewBox="0 0 70 40" fill="none" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round">
    <defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#6d6af7"/><stop offset="1" stop-color="#22b8d8"/></linearGradient></defs>
    <path d="M14 8 2 20l12 12M56 8l12 12-12 12M41 4 29 36" stroke="url(#g)"/></svg>
    <span>Frontend<span class="helpers">Helpers</span></span></div>
  <h1>${esc(line1)}<br><span class="grad">${esc(line2)}</span></h1>
  <div class="pills">${pills.map(([b, d]) => `<span class="pill"><b>${esc(b)}</b> ${esc(d)}</span>`).join('')}</div>
  <div class="domain">frontendhelpers.com</div>`;
}

const only = process.argv[2];
const tmp = mkdtempSync(join(tmpdir(), 'og-'));
try {
  for (const [name, spec] of Object.entries(IMAGES)) {
    if (only && only !== name) continue;
    const html = join(tmp, `${name}.html`);
    writeFileSync(html, page(spec));
    const out = join(ROOT, 'assets', `${name}.png`);
    execFileSync(browser, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
      '--window-size=1200,630', '--default-background-color=00000000', `--screenshot=${out}`, pathToFileURL(html).href],
      { stdio: 'ignore', timeout: 60000 });
    console.log(`rendered assets/${name}.png`);
  }
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
