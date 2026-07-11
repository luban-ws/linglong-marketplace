# gopdfjs site reference

Canonical implementation: `gopdfjs/gopdfjs` repo, `apps/site/`.

## File map

| File | Role |
|------|------|
| `vite-plugins/resolveSiteBase.ts` | `GITHUB_PAGES` / `CUSTOM_DOMAIN` / `VITE_BASE` → `/gopdfjs/` |
| `vite-plugins/wsxPressBasePlugin.ts` | Compile-time wsx-press URL rewrite |
| `src/sitePaths.ts` | `sitePath()`, `normalizeSitePathname()` |
| `src/i18n.ts` | `loadPath` uses `SITE_BASE` |
| `vite.config.ts` | `base`, plugins, `copy404Plugin`, `copyWsxPressPlugin` |
| `package.json` | `build:pages`, `preview:pages` |
| `.github/workflows/deploy-site.yml` | `GITHUB_PAGES=true` in CI |
| `scripts/generate-sitemap.ts` | Path URLs (not hash) for SEO |

## Ports (gopdfjs)

- Dev: `5175`
- Preview: `5176`

## Live URL

https://gopdfjs.github.io/gopdfjs/
