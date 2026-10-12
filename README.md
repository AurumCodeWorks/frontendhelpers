# FrontendHelpers

Source for [frontendhelpers.com](https://frontendhelpers.com): free, browser-based tools, a CSS animation library, JavaScript tips and guides for frontend developers. Built and maintained by AurumCodeWorks.

Plain HTML, CSS and vanilla JavaScript — no framework, no runtime dependencies.

## Working on the site

Edit the files in the repo root, then:

```bash
npm run check     # quality gate: canonicals, links, anchors, JSON-LD, sitemap, redirects
npm run preview   # build to dist/ and serve it locally with Cloudflare's dev server
```

Internal links use clean URLs (`/contrast-checker`, not `contrast-checker.html`). When you add a page, also add it to `sitemap.xml`, `llms.txt` and `_redirects` — `npm run check` fails until you do.

## Deployment

`.github/workflows/deploy.yml` runs on every push and pull request:

1. **Quality gate** — `scripts/check.mjs`; any error blocks the deploy.
2. **Build** — `scripts/build.mjs` copies the site (minus tooling) into `dist/`.
3. **Deploy** — `wrangler pages deploy` to Cloudflare Pages. Pushes to `main` go to production; other branches and pull requests get a preview URL.

Required repository settings (Settings → Secrets and variables → Actions):

| Kind | Name | Value |
|---|---|---|
| Secret | `CLOUDFLARE_API_TOKEN` | API token with **Cloudflare Pages: Edit** on the account |
| Variable | `CLOUDFLARE_ACCOUNT_ID` | The Cloudflare account ID that owns the Pages project |
| Variable | `CF_PAGES_PROJECT` | The Pages project name |

Until `CF_PAGES_PROJECT` is set, the workflow runs the quality gate only.
