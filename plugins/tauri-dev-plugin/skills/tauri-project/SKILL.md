---
name: tauri-project
description: Use this skill whenever you work in the xuanwu (玄武) Tauri monorepo—pnpm workspace only, apps/desktop Tauri plus Vite plus React, packages/ui exported as @xuanwu/ui, packages/config-* shared tool configs, tauri.conf.json and src-tauri Rust including PTY paths, pnpm dev versus pnpm --filter desktop dev, adding deps with pnpm add --filter desktop, or steering users away from npm. Also use for the three-column product layout (Sidebar file tree plus Git, TerminalArea with xterm, TaskPanel) and shared styling via CSS variables in packages/ui.
---

# Tauri project (xuanwu monorepo)

Keeps desktop and shared packages aligned with the repo’s **pnpm-only** contract and the documented app layout.

## Monorepo layout

- **`apps/desktop/`**: Main Tauri + React + Vite app; owns the three-column shell; hosts xterm.js and PTY-oriented Rust under `src-tauri/`.
- **`packages/ui/`**: Shared React; published path **`@xuanwu/ui`** for the desktop app.
- **`packages/config-*`**: Shared lint and TypeScript bases—extend these instead of forking one-off config per app.

## Package manager

- Root `package.json` pins `packageManager` and `preinstall` runs `npx only-allow pnpm`: treat **`pnpm`** as mandatory.
- Run **`pnpm install`** from the **repository root**; do not run `npm install` / `npm ci` in the tree (including under `apps/desktop`).
- The lockfile is **`pnpm-lock.yaml`**. Ignore or delete stray `package-lock.json` and reinstall from root if it appears.

## Common commands

- Full dev graph (apps and packages): `pnpm dev`
- Desktop app only: `pnpm --filter desktop dev`
- Add a dependency to desktop: `pnpm add <pkg> --filter desktop`
- Wire local UI package: `pnpm add @xuanwu/ui --filter desktop`

## Tauri touchpoints

- App shell config: `apps/desktop/src-tauri/tauri.conf.json`
- Rust entry and integrations (including PTY): `apps/desktop/src-tauri/src/main.rs` (adjust if the crate layout moves—keep paths relative to the actual crate root)

## UI layout expectations

1. **Left**: `@xuanwu/ui` sidebar (file tree plus Git affordances).
2. **Middle**: `@xuanwu/ui` terminal area (xterm.js plus AI log stream as designed).
3. **Right**: `@xuanwu/ui` task panel (tasks plus primary input).

Prefer **CSS variables** and tokens defined in `packages/ui` so desktop and future surfaces stay visually consistent.
