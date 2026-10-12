# FrontendHelpers

Source for [frontendhelpers.com](https://frontendhelpers.com): free, browser-based tools, a CSS animation library, JavaScript tips and guides for frontend developers. Built and maintained by AurumCodeWorks.

Plain HTML, CSS and vanilla JavaScript — no framework, no runtime dependencies.

## Working on the site

Edit the files in the repo root, then:

```bash
npm run generate  # re-render the static animation reference + JS tips from their data files
npm run check     # quality gate: generated HTML fresh, canonicals, links, anchors, JSON-LD, sitemap, redirects
npm run preview   # build to dist/ and serve it locally with Cloudflare's dev server
```

Internal links use clean URLs (`/contrast-checker`, not `contrast-checker.html`). When you add a page, also add it to `sitemap.xml`, `llms.txt` and `_redirects` — `npm run check` fails until you do.

## Deployment

The site is a static-assets **Cloudflare Worker** (`summer-butterfly-6a5f`, config in `wrangler.jsonc`) serving `frontendhelpers.com` and `www.frontendhelpers.com`. `.github/workflows/deploy.yml` runs on every push and pull request:

1. **Quality gate** — `scripts/check.mjs`; any error blocks the deploy.
2. **Build** — `scripts/build.mjs` copies the site (minus tooling) into `dist/`.
3. **Deploy** — pushes to `main` run `wrangler deploy` (production). Pull requests upload a preview version at a `pr-<number>` preview URL without touching production.

Required repository settings (Settings → Secrets and variables → Actions):

| Kind | Name | Value |
|---|---|---|
| Secret | `CLOUDFLARE_API_TOKEN` | API token with **Workers Scripts: Edit** (account) and **Workers Routes: Edit** + **Zone: Read** (frontendhelpers.com) |
| Variable | `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID |
| Variable | `DEPLOY_ENABLED` | `true` to deploy; anything else runs the quality gate only |
