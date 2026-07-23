# RFC 0004: Tauri Dev/Prod Build Isolation & Updater Signing Modular Skills

**Status:** Under Review  
**Created:** 2026-07-22

## Summary

Rename `tauri-plugin` to `tauri-dev-plugin` and split complex Tauri v2 runtime operations into two modular, highly-focused skills: `tauri-dev-prod-isolation` and `tauri-updater-signing`.

## Motivation

- **Dev/Prod Coexistence Risk**: Tauri v2 applications sharing `tauri.conf.json`'s `identifier` field across dev and prod environments cause data corruption (shared `app_data_dir()`), single-instance socket collisions, and unintended background updater calls during local dev.
- **CI Signing Failures**: Key generation with `tauri signer generate` in non-interactive CI environments fails or hangs when passwordless keys are used.
- **Single-Responsibility Skill Design**: Combining local dev/prod runtime isolation with release-time updater signing into one large skill document dilutes description precision, increasing prompt token overhead and leading to inaccurate agent skill triggers.

## Proposal

1. **Plugin Restructuring & Rename**:
   - Rename `plugins/tauri-plugin` to `plugins/tauri-dev-plugin`.
2. **Modular Skill Breakdown**:
   - **`tauri-dev-prod-isolation`**: Focuses strictly on runtime identifier isolation, single-instance socket scoping, and `--config tauri.dev.conf.json` overlay patterns.
   - **`tauri-updater-signing`**: Focuses strictly on `tauri-plugin-updater` configuration, non-interactive CI signing key password fixes, and `createUpdaterArtifacts` build assertions.
3. **Marketplace & Documentation Synchronization**:
   - Update `.claude-plugin/marketplace.json` to register both skills under `tauri-dev-plugin`.
   - Update `README.md` and catalog tooling to document the modular skill breakdown.

## Implementation notes

- Created skill directory `plugins/tauri-dev-plugin/skills/tauri-dev-prod-isolation/`.
- Proposed addition of skill directory `plugins/tauri-dev-plugin/skills/tauri-updater-signing/`.
- Validated manifest rules via `@linglongjs/skill-validator`.
