# Example sites reference

## productivity (current)

Repo: `luban-ws/productivity`, `apps/site/`.

Live: https://luban-ws.github.io/productivity/

Package: `@wsxjs/wsx-press@^0.2.0`

| File | Role |
|------|------|
| `vite-plugins/resolveSiteBase.ts` | `GITHUB_PAGES` / `CUSTOM_DOMAIN` / `VITE_BASE` → `/productivity/` |
| `src/press-base.ts` | `configurePressBase(import.meta.env.BASE_URL)` — same as official `press-init.ts` |
| `src/main.ts` | `import "./press-base"` before `./App.wsx` |
| `src/App.wsx` | `import "@wsxjs/wsx-press/client"`; `sitePath("/docs/*")` for router |
| `src/sitePaths.ts` | `sitePath()`, `siteAsset()`, `normalizeSitePathname()` — parallel to wsx-press paths |
| `src/i18n.ts` | `loadPath` uses `SITE_BASE` |
| `vite.config.ts` | `base`, `wsxPress` node plugin, `copy404Plugin`, `copyWsxPressPlugin` |
| `package.json` | `build:pages`, `preview:pages` |

Notes:

- Uses `press-base.ts` naming; official wsx-press README uses `press-init.ts` — same pattern.
- Import from `@wsxjs/wsx-press/client` in press-base works when import order is correct; `/client/paths` is preferred.
- Optional ambient declarations are only needed for builds without `./client/paths` types; 0.2.0 ships `dist/client/paths.d.ts`.
- **No** `wsxPressBasePlugin`.

## Official wsx-press integration

```typescript
// press-init.ts
import { configurePressBase } from "@wsxjs/wsx-press/client/paths";
configurePressBase(import.meta.env.BASE_URL);

// main.ts
import "./press-init";
import "@wsxjs/wsx-press/client";
```

## gopdfjs (legacy — pre-0.2.0)

Repo: `gopdfjs/gopdfjs`, `apps/site/`.

Live: https://gopdfjs.github.io/gopdfjs/

Used compile-time `vite-plugins/wsxPressBasePlugin.ts`. **Migrate** to `configurePressBase` when bumping wsx-press.

| File | Role |
|------|------|
| `vite-plugins/resolveSiteBase.ts` | base → `/gopdfjs/` |
| ~~`vite-plugins/wsxPressBasePlugin.ts`~~ | **Deprecated** |
| `src/sitePaths.ts` | `sitePath()`, `normalizeSitePathname()` |
| `vite.config.ts` | `base`, plugins, `copy404Plugin`, `copyWsxPressPlugin` |
| `.github/workflows/deploy-site.yml` | `GITHUB_PAGES=true` in CI |

## Ports (gopdfjs)

- Dev: `5175`
- Preview: `5176`
