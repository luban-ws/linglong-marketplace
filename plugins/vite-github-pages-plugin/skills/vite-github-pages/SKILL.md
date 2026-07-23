---
name: vite-github-pages
description: >-
  Deploy Vite SPAs to GitHub Pages project sites with correct subpath base (`/repo/`),
  History API routing, i18n asset URLs, and wsx-press subpath support via configurePressBase.
  Use when GitHub Pages 404s, links jump to domain root, locales fail to load,
  wsx-link navigates to `/packages` instead of `/repo/packages`, wsx-press fetches
  `/.wsx-press/` instead of `/repo/.wsx-press/`, or when replacing fetch patches,
  hash redirects, post-bundle string replace, or wsxPressBasePlugin hacks.
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

**wsx-router has no base awareness** — the app must prefix every `wsx-link` `to` and `wsx-view` `route`:

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

Example router registration:

```tsx
<wsx-view route={sitePath("/docs/*")} component="doc-section" />
```

## i18n / static assets

Prefix fetch paths with `SITE_BASE`:

```typescript
loadPath: `${SITE_BASE}locales/{{lng}}/{{ns}}.json`
```

Same rule for any `fetch('/...')` in app code.

## wsx-press subpath (>= 0.2.0, RFC 0067)

`@wsxjs/wsx-press` ships runtime base via `configurePressBase`. **Do not** use a Vite transform plugin or post-build string replace.

Root deploy (`base: "/"`): `configurePressBase` is optional (defaults to `/`).

### 1. Create `src/press-init.ts`

Import from **`@wsxjs/wsx-press/client/paths`** — not the full client entry — so components are not registered before base is set:

```typescript
import { configurePressBase } from "@wsxjs/wsx-press/client/paths";

configurePressBase(import.meta.env.BASE_URL);
```

`@wsxjs/wsx-press/client` also re-exports paths, but the `/paths` subpath avoids early component side effects.

### 2. Import first in `main.ts`

```typescript
import "./press-init";              // MUST run before wsx-press client
import "@wsxjs/wsx-press/client";  // or via App.wsx that imports client
// …then mount app
```

`configurePressBase` must run **before** doc components connect or fetch.

### 3. Vite config — standard node plugin only

```typescript
import { wsxPress } from "@wsxjs/wsx-press/node";

export default defineConfig({
  base: siteBase,   // must match configurePressBase value
  plugins: [
    wsxPress({ docsRoot, outputDir: ".wsx-press" }),
    copyWsxPressPlugin(),  // cp .wsx-press → dist/.wsx-press on build
    copy404Plugin(),
  ],
});
```

**Remove** `wsxPressBasePlugin` if present — obsolete since wsx-press 0.2.0.

### Dual base config (app + wsx-press)

Both layers read the same value:

| Layer | Config | Scope |
|-------|--------|-------|
| App (`sitePaths.ts`) | `import.meta.env.BASE_URL` | wsx-router routes, i18n, static assets |
| wsx-press (`configurePressBase`) | same `BASE_URL` | doc fetches, sidebar nav, search |

wsx-press does **not** configure wsx-router. App keeps `sitePath()` for router; wsx-press uses `pressSitePath()` internally.

### Public API (`@wsxjs/wsx-press/client/paths`)

Official types: `@wsxjs/wsx-press/client/paths` → `dist/client/paths.d.ts`.

| Export | Purpose |
|--------|---------|
| `configurePressBase(base)` | Set base once at boot |
| `getPressBase()` | Current base (default `/`) |
| `resetPressBase()` | Reset to default (tests) |
| `pressAsset("docs-meta.json")` | → `/repo/.wsx-press/docs-meta.json` |
| `pressDocMarkdownUrl("guide/intro")` | → `/repo/docs/guide/intro.md` |
| `pressSitePath("/docs/foo")` | → `/repo/docs/foo` |
| `stripPressBase(pathname)` | Strip base → app route |
| `getDocsRelativePath(pathname)` | Strip base → doc relative path or null |
| `DOCS_ROUTE_PREFIX` | `"/docs"` (app-internal routes) |
| `normalizeSiteBase(base)` | Normalize Vite-style base string |

**metadata.route** in generated JSON stays app-internal (`/docs/guide/intro`, no base prefix). Base is applied only at fetch / History API time.

### Dev vs prod

- **Prod**: copy `.wsx-press/` → `dist/.wsx-press/`; client fetches via `pressAsset()`.
- **Dev**: Vite strips `config.base` before middleware; node plugin mounts at `/.wsx-press`. Client `pressAsset()` still prefixes base in fetch URLs.

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
- [ ] `wsx-link` / `wsx-view` resolve to `/repo/...`, not `/...`
- [ ] i18n requests `/repo/locales/...`
- [ ] wsx-press fetches `/repo/.wsx-press/docs-meta.json`
- [ ] Doc markdown loads from `/repo/docs/.../*.md`
- [ ] `404.html` has no `location.replace` hack
- [ ] No `wsxPressBasePlugin` in `vite.config.ts`
- [ ] `press-init` imported before `@wsxjs/wsx-press/client`
- [ ] `pnpm preview:pages` — nav + refresh on deep routes work

## Do not use

| Hack | Why it fails |
|------|----------------|
| Global `fetch` patch | Double-prefixes some URLs; misses others |
| Post-bundle `dist` string replace | Corrupts attrs inconsistently; unmaintainable |
| `wsxPressBasePlugin` Vite transform | Obsolete since wsx-press 0.2.0; patches consumer not library |
| Relying on wsx-press alone for router base | wsx-router is out of scope; app must use `sitePath()` |
| Hash routing fallback + 404 redirect | Strips deep paths; fights History API |
| `mode="hash"` on wsx-router | Ignored by wsx-router |

## Reference

- **Package docs**: `@wsxjs/wsx-press` README § "Configure site base"
- **RFC**: wsxjs `.spec/rfc/0067-wsx-press-configurable-site-base.md`
- **Canonical site**: productivity `apps/site`
- **Legacy**: gopdfjs used `wsxPressBasePlugin` — migrate on bump to wsx-press >= 0.2.0

See [references/example-sites.md](references/example-sites.md) for file map.
