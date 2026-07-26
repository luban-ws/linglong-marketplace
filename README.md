# Linglong marketplace

Standard **Claude Code plugin marketplace** (`linglong-marketplace`) with domain-scoped plugins:

| Plugin | Skills |
|--------|--------|
| `tauri-dev-plugin` | `tauri-project`, `tauri-dev-prod-isolation`, `tauri-theme-management`, `tauri-macos-keyboard`, `tauri-macos-help-menu` |
| `rfc-plugin` | `rfc-management`, `rfc-workflow` |
| `macos-swiftpm-plugin` | `macos-swiftpm-cli-app`, `macos-swiftpm-app-deployer` |
| `vite-github-pages-plugin` | `vite-github-pages` |

**pnpm + Turbo monorepo** — `packages/` holds **@linglongjs build tools**; `plugins/` holds marketplace content.

| Location | Role |
|----------|------|
| [`packages/skill-validator`](packages/skill-validator) | **`ll-skills`** — validate skills (public npm) |
| [`packages/marketplace`](packages/marketplace) | **`ll-catalog`** — export `catalog.json` for browse sites |
| [`apps/site`](apps/site) | Vite intro site → GitHub Pages |
| [`plugins/`](plugins) | Plugin packages + `SKILL.md` files |

See [packages/README.md](packages/README.md) for the toolchain overview.

## Browse & install

**Site:** [GitHub Pages](https://systembugtj.github.io/linglong-marketplace/)

**Source:** [github.com/systembugtj/linglong-marketplace](https://github.com/systembugtj/linglong-marketplace)

**Quick install** (macOS / Linux, [Claude Code CLI](https://code.claude.com/docs/en/cli)):

```bash
curl -fsSL https://raw.githubusercontent.com/systembugtj/linglong-marketplace/main/install.sh | sh
```

**In Claude Code** (Git HTTPS, not Pages URL):

```text
/plugin marketplace add https://github.com/systembugtj/linglong-marketplace.git
/plugin install tauri-dev-plugin@linglong-marketplace
/plugin install rfc-plugin@linglong-marketplace
/plugin install macos-swiftpm-plugin@linglong-marketplace
/plugin install vite-github-pages-plugin@linglong-marketplace
```

## Build tools (from repo root)

```bash
pnpm skills      # ll-skills — validate marketplace + SKILL.md
pnpm catalog     # ll-catalog — write apps/site/public/catalog.json
pnpm check       # all packages: validate + test
pnpm dev         # catalog + Vite dev server
pnpm build       # production site → apps/site/dist
```

Any marketplace repo (npm):

```bash
npx @linglongjs/skill-validator    # ll-skills
ll-skills --help
```

## Layout

```
.claude-plugin/marketplace.json
.spec/ROADMAP.md            # RFC index + phases
.spec/TASK_TRACKING.md      # tasks
.spec/rfc/                  # RFC bodies only
install.sh
packages/                   # @linglongjs CLIs + libraries
  skill-validator/          # ll-skills
  marketplace/              # ll-catalog (@linglongjs/marketplace-build)
apps/site/                  # GitHub Pages app
plugins/                    # marketplace content
```

**Specs:** [ROADMAP](.spec/ROADMAP.md) · [TASK_TRACKING](.spec/TASK_TRACKING.md)

## GitHub Pages

Push to `main` → [deploy workflow](.github/workflows/deploy-pages.yml) runs `pnpm build --filter @linglongjs/site`.

**Settings → Pages → Source:** GitHub Actions (once per repo).
