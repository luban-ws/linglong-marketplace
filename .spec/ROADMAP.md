# Roadmap

**Canonical RFC index and phase plan** for linglong-marketplace.  
Tasks: [TASK_TRACKING.md](TASK_TRACKING.md)

RFC files: `.spec/rfc/NNNN-kebab-slug.md` — numbering, status, and sections below; no separate README under `.spec/`.

## RFC index

| ID | RFC | Status |
|----|-----|--------|
| 0001 | [@linglongjs packages toolchain](rfc/0001-linglongjs-toolchain.md) | Implemented |
| 0002 | [Standard Claude Code plugin marketplace](rfc/0002-standard-plugin-marketplace.md) | Implemented |
| 0003 | [GitHub Pages intro site and install flow](rfc/0003-github-pages-intro-site.md) | Implemented |
| 0004 | [Tauri Dev/Prod Build Isolation & Updater Signing Modular Skills](rfc/0004-tauri-dev-prod-isolation.md) | Under Review |

## Phase 1 — Marketplace foundation (done)

RFCs: 0001, 0002

Deliverables: domain-scoped `plugins/*`, `.claude-plugin/marketplace.json`, Husky + `pnpm check`, Python removed.

## Phase 2 — Discoverability (done)

RFCs: 0003

Deliverables: `site/`, `install.sh`, `ll-skills` / `ll-catalog`, README ↔ Pages links.

## Phase 3 — Ecosystem (next)

| Item | Notes |
|------|-------|
| Publish `@linglongjs/skill-validator` | npm |
| Publish `@linglongjs/marketplace-build` | optional |
| More domain plugins | templates for contributors |

## RFC conventions

- **Path:** `.spec/rfc/NNNN-kebab-slug.md` (next id = max in index + 1)
- **Status** (header + table above): Draft · Under Review · Approved · Implemented · Rejected · Superseded
- **Body sections:** Summary, Motivation, Proposal, Implementation notes, Alternatives (optional)
- **Tasks:** only in [TASK_TRACKING.md](TASK_TRACKING.md) — never duplicate checklists in RFC files
- **Archive:** move to `rfc/completed/` or `rfc/rejected/` and update this file in the same change set
