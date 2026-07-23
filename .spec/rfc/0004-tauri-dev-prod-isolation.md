# RFC 0004: Tauri Dev/Prod Build Isolation & Updater Signing Guidelines

**Status:** Implemented  
**Created:** 2026-07-22

## Summary

Add a dedicated `tauri-dev-prod-isolation` skill under `plugins/tauri-dev-plugin/` and rename `tauri-plugin` to `tauri-dev-plugin` to serve as a comprehensive development toolkit for Tauri v2 monorepo setups.

## Motivation

- Tauri v2 applications sharing `tauri.conf.json`'s `identifier` field across dev and prod environments cause subtle data corruption (shared `app_data_dir()`), unexpected single-instance socket collisions, and unintended background updater polls to production feeds during dev runs.
- Key generation using `tauri signer generate` in non-interactive CI environments fails silently or errors out when passwordless keys are used.
- Need empirical, production-verified guidelines for Tauri v2 dev/prod channel separation (`--config` overlays, updater endpoint overrides, and CI signing key practices).

## Proposal

1. **Rename & Re-structure Plugin**:
   - Rename `plugins/tauri-plugin` to `plugins/tauri-dev-plugin`.
   - Add skill `tauri-dev-prod-isolation` containing core ground truths on Tauri runtime identifier scoping, config overlay patterns (`tauri.dev.conf.json`), non-interactive updater signing setups, and `createUpdaterArtifacts` CI assertions.
2. **Marketplace & Documentation Synchronization**:
   - Update `.claude-plugin/marketplace.json` to reference `tauri-dev-plugin` v1.1.0.
   - Update `README.md` and repo documentation to list `tauri-dev-plugin` and its skills (`tauri-project`, `tauri-dev-prod-isolation`).

## Implementation notes

- Created [plugins/tauri-dev-plugin/skills/tauri-dev-prod-isolation/SKILL.md](file:///Volumes/ORICO/ws/prj/systembug/linglong-marketplace/plugins/tauri-dev-plugin/skills/tauri-dev-prod-isolation/SKILL.md).
- Updated manifest entries in `.claude-plugin/marketplace.json`.
- Enforced full validation via `@linglongjs/skill-validator` (`pnpm run check`).
