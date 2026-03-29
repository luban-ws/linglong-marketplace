# Linglong marketplace

Claude Code skill marketplace: curated **skills** under `plugins/` for local or team use.

**GitHub Pages** deploys automatically via [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml) on every push to `main` (build → `upload-pages-artifact` → `deploy-pages`). **Settings → Pages → Source** must be **GitHub Actions** (see [Publishing with a custom workflow](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site#publishing-with-a-custom-github-actions-workflow)).

The public demo is **React + Vite** in [`site/web`](site/web): `scripts/build_site.py` writes `catalog.json` / `manifest.json` into `site/web/public/`, then runs `vite build` into `_site/`. **Local preview:** `npm run build:site`, then serve `_site/` over HTTP (for example `npx --yes serve _site`), because the app loads `/catalog.json` at runtime. **Hot dev:** `python3 scripts/build_site.py --export-public-only` then `npm run dev --prefix site/web`. Optional manual branch deploy: `npm run deploy:pages` (pushes `gh-pages` branch).

## Layout

- `site/web/` — **Vite + React** demo for GitHub Pages; build output goes to `_site/` via `scripts/build_site.py`.
- `.claude-plugin/marketplace.json` — marketplace manifest (plugin `linglong-skills` bundles the skill paths).
- `plugins/macos-swiftpm-cli-app/` — SwiftPM macOS executable → shell-assembled `.app`.
- `plugins/macos-swiftpm-app-deployer/` — `pnpm run deploy`, `deploy.sh`, `/Applications` copy; not bare `pnpm deploy`.
- `plugins/tauri-project/` — xuanwu Tauri + pnpm monorepo conventions (`apps/desktop`, `@xuanwu/ui`).
- `plugins/rfc-management/` — generic RFC plus roadmap plus task-tracker alignment (paths discovered per repo).
- `plugins/rfc-workflow/` — generic RFC analysis, approval gates, controlled implementation.
- `plugins/*.skill` — distributable bundles per skill; regenerate after edits via Anthropic `skill-creator` `scripts/package_skill.py` (`evals/` is omitted from bundles).

Directory names use **kebab-case** in this repo (`tauri-project`, `rfc-management`). Your global `~/.claude/skills` may still use underscores; keep **`name:`** in `SKILL.md` as here if you copy files back.

## Use with Claude Code

Add this folder as a marketplace (path install), then install the plugin per [Claude Code plugins documentation](https://code.claude.com/docs/en/plugins). Skills are loaded from the paths listed in `marketplace.json`.

## Copy-only install

To install skills without the marketplace UI, copy a skill directory into `~/.claude/skills/` (or install the `.skill` bundle if your client supports it).

## Evals

Each skill may include `evals/evals.json` (prompts for manual or automated runs). See Anthropic `skill-creator` for the full eval loop.

## Quality checks (Husky)

Requires a **git** repo, **Node/npm**, and **Python 3** with `PyYAML`:

```bash
pip install -r requirements-dev.txt
npm install
npm ci --prefix site/web
```

- **`npm run validate`** — parses `.claude-plugin/marketplace.json`, checks every listed skill directory and `SKILL.md`, ensures each `plugins/<name>/SKILL.md` is registered in the manifest (no drift), validates frontmatter (`name`, `description` length, forbidden keys, kebab-case rules).
- **`npm run test`** — Python `unittest` suite in `tests/` (includes a full Vite production build smoke test).
- **`npm run test:site`** — Vitest unit tests for `site/web` (e.g. skill filter helpers).
- **`npm run check`** — validate, Python tests, and site tests.

**Husky** runs `npm run check` on **pre-commit** and **pre-push**. If hooks are missing after clone, run `npm install` (runs the `prepare` script).

## GitHub Pages setup (GitHub Actions)

1. **Settings → Pages → Build and deployment → Source:** select **GitHub Actions** (once per repo).
2. Push to `main` (or run workflow manually: **Actions → Deploy GitHub Pages → Run workflow**). The workflow builds `_site` and publishes with `actions/deploy-pages`.
3. After the first successful run, the site URL appears on the workflow run summary and under **Settings → Pages** (for this org/repo it is typically `https://luban-ws.github.io/linglong-marketplace/`).

| Command | Purpose |
|--------|---------|
| `npm run build:site` | Generate `site/web/public/catalog.json`, run Vite build, write `_site/` (SPA + static JSON). |
| `npm run deploy:pages` | Optional: push an orphan **`gh-pages`** branch (only if you prefer branch hosting instead of Actions). |

Trigger with [GitHub CLI](https://cli.github.com/):

```bash
gh workflow run "Deploy GitHub Pages"
```
