# Linglong marketplace

Claude Code skill marketplace: curated **skills** under `plugins/` for local or team use.

## Layout

- `.claude-plugin/marketplace.json` — marketplace manifest (plugin `linglong-skills` bundles the skill paths).
- `plugins/macos-swiftpm-cli-app/` — SwiftPM macOS executable → shell-assembled `.app`.
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
```

- **`npm run validate`** — parses `.claude-plugin/marketplace.json`, checks every listed skill directory and `SKILL.md`, ensures each `plugins/<name>/SKILL.md` is registered in the manifest (no drift), validates frontmatter (`name`, `description` length, forbidden keys, kebab-case rules).
- **`npm run test`** — `unittest` suite in `tests/`.
- **`npm run check`** — both.

**Husky** runs `npm run check` on **pre-commit** and **pre-push**. If hooks are missing after clone, run `npm install` (runs the `prepare` script).
