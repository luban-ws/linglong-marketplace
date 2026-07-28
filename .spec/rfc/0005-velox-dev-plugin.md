# RFC 0005: Velox desktop development plugin

**Status:** Implemented
**Created:** 2026-07-27

## Summary

Add `velox-dev-plugin` with one shared `velox-development` skill for Claude Code and Codex. The skill makes the official Velox CLI the owner of development, build, and app-bundle workflows.

## Motivation

Velox desktop failures often pass source-level checks but fail at the real macOS boundary: a bare Swift executable shows a generic Dock icon, `bundle.icon` is confused with window configuration, or an app crashes because a native runtime dylib still points at an absolute build path.

Project-specific shell wrappers hide these ownership errors. Reusable guidance must prefer the pinned Velox CLI through pnpm, prohibit new `.sh` glue, and require runtime evidence from the generated `.app`.

## Proposal

Create a domain plugin with:

- `.claude-plugin/plugin.json` for this marketplace.
- `.codex-plugin/plugin.json` for Codex compatibility.
- `skills/velox-development/SKILL.md` as the single workflow source.
- A macOS bundle-runtime reference and realistic eval cases.

The workflow covers configuration ownership, CLI-first pnpm commands, icons, bundled native libraries, install names, code signing, single-instance identifiers, debug/release naming, and live app acceptance.

## Implementation notes

- Use `velox dev`, `velox build --debug --bundle`, and `velox build --bundle` directly through pnpm scripts.
- Keep product name, bundle identifier, icon, resources, and hooks in `velox.json`.
- Use JavaScript or TypeScript only when current pinned Velox behavior proves a missing lifecycle capability. Do not replace the Velox bundler.
- Verify upstream behavior again before applying the documented `libvelox_runtime_wry_ffi.dylib` workaround; the evidence came from Velox commit `f9a37edbac01b160c574e96c46b084a01da1ecf8`.
- Accept completion only after metadata, load commands, bundled resources, signing, launch stability, and visible Dock identity pass.

## Alternatives

A Claude-only plugin would match the current repository layout but duplicate future work when Codex support is needed. A custom bundler would own too much framework behavior and drift from Velox. Both are rejected.
