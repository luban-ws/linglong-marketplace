---
name: tauri-project
description: Use this skill whenever you work in a pnpm-workspace monorepo containing a Tauri v2 + Vite + React (or Vue) desktop app alongside shared packages (e.g. a shared UI package, shared lint/TypeScript config packages), when deciding pnpm dev vs a filtered per-app dev command, when adding deps with pnpm add --filter <app>, when steering users away from npm/yarn in a pnpm-only repo, or when locating tauri.conf.json and the src-tauri Rust entrypoint inside an app package.
---

# Tauri project (pnpm monorepo conventions)

Keeps a Tauri desktop app and its shared packages aligned with a **pnpm-only** monorepo contract. Adapt the placeholder names below (`<app>`, `@scope/ui`) to the actual workspace layout — inspect `pnpm-workspace.yaml` and root `package.json` first rather than assuming paths.

## Monorepo layout (typical shape)

- **`apps/<app>/`**: Tauri + Vite frontend app; hosts `src-tauri/` for the Rust side.
- **`packages/ui/`** (or similar): Shared component package, consumed via a workspace-scoped import (e.g. `@scope/ui`).
- **`packages/config-*`**: Shared lint/TypeScript bases — extend these instead of forking one-off config per app.

Confirm actual package names and paths in the repo before applying commands below; don't assume a specific scope or app name.

## Package manager

- If root `package.json` pins `packageManager` and/or `preinstall` runs `only-allow pnpm`, treat **`pnpm`** as mandatory for that repo.
- Run **`pnpm install`** from the **repository root**; do not run `npm install` / `npm ci` inside individual app packages.
- The lockfile is **`pnpm-lock.yaml`**. Ignore or delete a stray `package-lock.json` and reinstall from root if one appears.

## Common commands

- Full dev graph (all apps and packages): `pnpm dev`
- Single app only: `pnpm --filter <app> dev`
- Add a dependency to an app: `pnpm add <pkg> --filter <app>`
- Wire a local shared package into an app: `pnpm add @scope/ui --filter <app>`

## Tauri touchpoints

- App shell config: `apps/<app>/src-tauri/tauri.conf.json`
- Rust entry point: `apps/<app>/src-tauri/src/main.rs` (adjust to the actual crate root if the layout differs)

## Shared UI conventions

- Prefer components and CSS variables/tokens from the shared UI package over ad hoc per-app styling, so multiple app surfaces stay visually consistent.
- When a shared package changes, check which apps consume it (`pnpm -r ls` or workspace graph) before assuming a change is app-local.

**See also**: `tauri-dev-prod-isolation` for dev/prod build separation and updater config once the app itself needs those; `tauri-theme-management` for prod theming bugs.
