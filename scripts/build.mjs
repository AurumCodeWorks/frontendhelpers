// Build: copy the deployable site into dist/.
// The repo root is the site source; this keeps tooling (scripts/,
// .github/, package.json, README) out of what Cloudflare serves.
import { cpSync, rmSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const OUT = join(ROOT, 'dist');
const EXCLUDE = new Set([
  '.git', '.github', '.gitignore', '.wrangler', 'node_modules',
  'dist', 'scripts', 'package.json', 'package-lock.json', 'README.md',
]);

rmSync(OUT, { recursive: true, force: true });
let count = 0;
for (const entry of readdirSync(ROOT)) {
  if (EXCLUDE.has(entry)) continue;
  cpSync(join(ROOT, entry), join(OUT, entry), { recursive: true });
  count++;
}
console.log(`Built dist/ from ${count} top-level entries`);
