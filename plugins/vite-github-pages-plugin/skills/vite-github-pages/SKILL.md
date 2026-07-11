---
name: vite-github-pages
description: >-
  Deploy Vite SPAs to GitHub Pages project sites with correct subpath base (`/repo/`),
  History API routing, i18n asset URLs, and wsx-router/wsx-press fixes.
  Use when GitHub Pages 404s, links jump to domain root, locales fail to load,
  wsx-link navigates to `/packages` instead of `/repo/packages`, or when replacing
  fetch patches, hash redirects, or post-bundle string replace hacks.
---

# Vite + GitHub Pages (subpath SPA)

Ship **project sites** (`https://<org>.github.io/<repo>/`) with Vite `base`, not runtime hacks.

## Base resolution

| Scenario | `base` |
|----------|--------|
| Local dev | `/` |
| GH Pages + custom domain (CNAME) | `/` |
| GH Pages project site (no CNAME) | `/<repo>/` |

Env contract:

- `GITHUB_PAGES=true` — CI / `build:pages`
- `CUSTOM_DOMAIN=true` — user/org site with CNAME
- `VITE_BASE` — optional override

```typescript
export function resolveSiteBase(repoSlug: string): string {
  if (process.env.VITE_BASE) return process.env.VITE_BASE;
  const isGhPages = process.env.GITHUB_PAGES === 'true';
  const hasCustomDomain = process.env.CUSTOM_DOMAIN === 'true';
  if (isGhPages && !hasCustomDomain) return `/${repoSlug}/`;
  return '/';
}
```

Wire in `vite.config.ts`: `base: resolveSiteBase('my-repo')`.

## Build scripts

```json
{
  "build:pages": "cross-env GITHUB_PAGES=true vite build",
  "preview:pages": "cross-env GITHUB_PAGES=true vite preview"
}
```

CI must set `GITHUB_PAGES: 'true'` on the pages build step.

## App routes — use `import.meta.env.BASE_URL`

`@wsxjs/wsx-router` uses **History API** on `window.location.pathname`. `mode="hash"` on `<wsx-router>` is ignored.

Every `wsx-link` `to` and `wsx-view` `path` must go through a helper:

```typescript
export const SITE_BASE = import.meta.env.BASE_URL;

export function sitePath(route: string): string {
  const base = SITE_BASE.endsWith('/') ? SITE_BASE.slice(0, -1) : SITE_BASE;
  if (route === '/' || route === '') {
    return SITE_BASE === '/' ? '/' : (SITE_BASE.endsWith('/') ? SITE_BASE : `${SITE_BASE}/`);
  }
  const segment = route.startsWith('/') ? route : `/${route}`;
  return base ? `${base}${segment}` : segment;
}
```

Call `normalizeSitePathname()` once at boot so `/repo` redirects to `/repo/`.

**Never** hardcode `/packages` or `/docs/...` in templates when deployed under a subpath.

## i18n / static assets

Prefix fetch paths with `SITE_BASE`:

```typescript
loadPath: `${SITE_BASE}locales/{{lng}}/{{ns}}.json`
```

Same rule for any `fetch('/...')` in app code.

## wsx-press subpath fix

`@wsxjs/wsx-press/client` hardcodes root-relative fetches (`"/.wsx-press/"`, `` `/docs/` ``). Fix at **compile time** with a Vite `transform` plugin on the client bundle only — not post-build string replace on `dist/`.

Rewrite:

- `"/.wsx-press/` → `"${base}/.wsx-press/`
- `` `/docs/` `` → `` `${base}/docs/` ``
- Doc route parsing: `startsWith("/docs/")` → `includes('/docs/')` + `split('/docs/')[1]`

No-op when `base === '/'`.

## SPA 404 fallback

For History API on GH Pages: **`404.html` = copy of `index.html`** (no redirect script).

```typescript
function copy404Plugin(): Plugin {
  return {
    name: 'copy-404',
    apply: 'build',
    closeBundle() {
      if (process.env.GITHUB_PAGES !== 'true') return;
      copyFileSync('dist/index.html', 'dist/404.html');
    },
  };
}
```

Redirect scripts that strip path segments break deep links.

## Verification checklist

After `pnpm build:pages`:

- [ ] Bundle defines `BASE_URL` as `/repo/`
- [ ] `wsx-link` resolves to `/repo/packages`, not `/packages`
- [ ] i18n requests `/repo/locales/...`
- [ ] wsx-press fetches `/repo/.wsx-press/...`
- [ ] `404.html` has no `location.replace` hack
- [ ] `pnpm preview:pages` — nav + refresh on deep routes work

## Do not use

| Hack | Why it fails |
|------|----------------|
| Global `fetch` patch | Double-prefixes some URLs; misses others |
| Post-bundle `dist` string replace | Corrupts `wsx-link` attrs inconsistently |
| Hash routing fallback + 404 redirect | Strips deep paths; fights History API |
| `mode="hash"` on wsx-router | Ignored by wsx-router |

## Reference

Battle-tested in **gopdfjs** `apps/site` (`72c8f88`). See [references/gopdfjs-example.md](references/gopdfjs-example.md) for file map.
