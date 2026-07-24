---
name: tauri-theme-management
description: Use this skill when a Tauri v2 + Vite app looks correctly themed in dev but wrong in production (split light/dark between main shell and modals/settings), when theme CSS is loaded from /src/themes or other dev-server paths, when considering runtime link tags pointing at hashed /assets/theme CSS for theme switching, when adding built-in themes to a Vite-bundled renderer, or when debugging missing CSS variables like --color-tree-bg or --color-splitter-bg in the Tauri WebView after tauri build. Code samples are TypeScript/DOM-API based (framework-agnostic injection via document.head), applicable to React, Vue, Svelte, or vanilla Vite renderers alike.
---

# Tauri production theme CSS (Vite renderer)

Root cause pattern: dev looks fine, prod main shell renders one theme while a modal/settings surface renders another. Cause is **loading theme CSS from a path that only exists under the Vite dev server**, not in `dist/`.

## Core fact: dev server paths die in `dist/`

A common Electron-era pattern:

```ts
// BAD — works in `vite dev`, 404 in Tauri production
link.href = `/src/themes/${themeId}/theme.css`;
```

- Vite dev serves `src/themes/**` at `/src/themes/**`.
- `tauri build` → `frontendDist` (`dist/`) has **no** `/src/themes`.
- `theme.json` imported at build time often holds **partial** CSS variables (card, text, primary).
- `theme.css` holds the **full** token surface (tree, splitter, list, scrollbar, shadows).
- Components using only JSON tokens look correct; chrome using CSS-only tokens fall back to global `:root` defaults in the base stylesheet → **split theming**.

Constants like `THEME_BASE_PATH = "/src/themes"` and `applyTheme(themeId, themeDir)` are symptoms of this mistake — remove them; they encode a dev-only assumption.

## Decision: bundle CSS with Vite `?raw`, inject synchronously

Do **not** use:

| Approach | Why it fails |
|----------|----------------|
| Runtime `/src/themes/...` URL | 404 in prod |
| Vite `?url` + `<link href="/assets/theme-*.css">` | Async load race; separate asset; Tauri WebView path edge cases |
| Only `theme.json` inline vars | Incomplete token set |

**Do** use:

1. `import darkCss from "./themes/dark/theme.css?raw"` in a `theme-styles.ts` module.
2. Map theme id → CSS string (`THEME_STYLESHEETS`).
3. In `applyTheme(themeId)`:
   - Set inline vars from `theme.json` (if you keep JSON metadata).
   - Remove old `#theme-style`.
   - Append `<style id="theme-style">` with `textContent = THEME_STYLESHEETS[themeId]` (**synchronous**).
   - Set `document.documentElement.setAttribute("data-theme", themeId)`.

```ts
// theme-styles.ts
import darkCss from "./themes/dark/theme.css?raw";

export const THEME_STYLESHEETS: Readonly<Record<string, string>> = {
  dark: darkCss,
  light: lightCss,
  // ...
};

// applyTheme(themeId) — excerpt
this._removeOldThemeStyle();
const stylesheet = THEME_STYLESHEETS[themeId];
if (stylesheet) {
  const el = document.createElement("style");
  el.id = "theme-style";
  el.textContent = stylesheet;
  document.head.appendChild(el);
}
document.documentElement.setAttribute("data-theme", themeId);
```

CSS ends up **inside the JS bundle** — no runtime fetch, no orphan `dist/assets/theme-*.css` files required.

## Vitest gotcha

Without `css: true` in `vitest.config.ts`, Vite stubs `?raw` CSS imports to `""` and tests pass falsely. Always enable:

```ts
test: { css: true }
```

Assert bundled CSS contains a distinctive token (e.g. `--color-tree-bg`) and that strings do **not** contain `/src/themes`.

## Add a built-in theme (checklist)

1. `src/themes/<id>/theme.json` + `theme.css`
2. Import JSON in theme loader / `loadBuiltInThemes()`
3. Import CSS `?raw` in `theme-styles.ts`
4. Unit tests for map coverage + `applyTheme` injects `#theme-style`
5. `vite build` → grep bundle for theme tokens; confirm no `/src/themes`
6. Local prod smoke: `tauri build` → install `.app` / binary → verify shell + settings share theme

## Debug workflow

1. **Split theming** → DevTools in prod build: is `#theme-style` present? Any 404 for theme CSS?
2. **Missing vars** → compare `--color-tree-bg` on `:root` vs selected theme.
3. **Build verify**:
   ```bash
   pnpm exec vite build
   rg "tree-bg|/src/themes" dist/assets/index-*.js
   ```
   Expect theme tokens in JS; no `/src/themes`.
4. **Local install** (macOS example):
   ```bash
   pnpm run build   # tauri build in app package
   ditto target/release/bundle/macos/MyApp.app /Applications/MyApp.app
   open -a /Applications/MyApp.app
   ```

## Checklist for a new theme-CSS setup

1. Never reference `/src/themes` or any other dev-server-only path at runtime — grep for it before shipping.
2. Import each theme's CSS with Vite `?raw`, not `?url` + `<link>`.
3. Inject synchronously via a `<style id="theme-style">` element, not an async fetch/link.
4. Set `css: true` in `vitest.config.ts` so `?raw` imports aren't stubbed to empty strings in tests.
5. After `vite build`, grep `dist/assets/index-*.js` for a real theme token and confirm `/src/themes` does not appear.
6. Smoke-test a real `tauri build` install, not just `vite build` — confirm shell and modals/settings share the same theme.

**Optional follow-up**: scope each `theme.css` to `[data-theme="<id>"]` instead of `:root, [data-theme]`, static-import all theme CSS in the app entrypoint, and toggle only `data-theme` — no JS injection needed. Requires editing every theme file; the `?raw` + inject approach above is the minimal safe fix and doesn't require this.

**See also**: `tauri-dev-prod-isolation` for other "works in dev, breaks in `tauri build`" failure modes (updater endpoints, single-instance locking).
