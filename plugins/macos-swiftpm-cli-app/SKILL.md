---
name: macos-swiftpm-cli-app
description: Use this skill whenever you build or ship macOS utilities from Swift Package Manager without living in an Xcode project—MenuBarExtra or LSUIElement accessories, shell-assembled App.app bundles, scripts that copy release binaries into Contents/MacOS, Info.plist and CFBundleIconFile, AppIcon.icns, ad-hoc codesign, embedded __info_plist for running the Mach-O directly, URL schemes, pnpm or turbo hooks that run swift test then pack an app, CI that must emit a signed bundle, or debates about SPM versus Xcode for small Mac tools. Also use when fixing Finder icons, menu bar template assets, PkgInfo, xattr before signing, or multi-display layout where the focused window screen should drive geometry (not only the mouse screen).
---

# macOS SwiftPM plus CLI-assembled .app

## Purpose

Executable SwiftPM targets emit a bare binary. A small shell pipeline assembles `Something.app` with `Contents/MacOS`, `Info.plist`, optional `Resources`, and signing. That keeps `Package.swift` as the source of truth and avoids `xcodebuild` for day-to-day work—important because teams want reproducible CLI builds and still ship a real bundle for Finder, TCC, and hotkeys.

## When this skill is a poor fit

- Mac App Store submission with heavy entitlements, App Extensions, or Widgets—plan on an Xcode project and `xcodebuild archive` (SPM can still be a dependency).
- Purely repo-local naming or ticket hygiene—put that in project `CLAUDE.md` or `AGENTS.md` instead.

## Core pattern

1. **`Package.swift`**: `executableTarget` for the app; optional `libraryTarget` for shared code; `platforms: [.macOS(...)]`.
2. **Release binary**: `swift build -c release`, then copy the product into `Target.app/Contents/MacOS/Target`.
3. **`Resources/Info.plist`**: Same keys as any Mac app; `CFBundleExecutable` matches the binary name; use `CFBundleIconFile` without extension plus `AppIcon.icns` under `Contents/Resources` when you need a branded Finder icon.
4. **Run Mach-O without the bundle**: Optional linker `-sectcreate __TEXT __info_plist ...` so URL schemes and LS flags exist when running the binary directly—details in [references/packaging.md](references/packaging.md).
5. **Signing**: Run `codesign --force --deep --sign -` on the bundle so OS features such as global hotkeys behave consistently.

## Quick reference

| Concern | Action |
|--------|--------|
| Icons in Finder | `AppIcon.icns` plus `CFBundleIconFile`; regenerate `.icns` when the master art changes |
| Menu bar image | Use a dedicated template asset in the bundle; `MenuBarExtra(systemImage:)` alone does not replace Finder icon branding |
| Multi-display layout | Prefer the focused window screen over mouse-only heuristics when choosing `NSScreen` |
| CI | Run `swift test`; release build plus pack script; do not commit `build/` |

## Go deeper

Read [references/packaging.md](references/packaging.md) when you need exact `build-app.sh` ordering, `PkgInfo`, `xattr` versus `codesign`, `iconutil`, pnpm or turbo wiring, or migration notes from an existing `.xcodeproj`.

## Common mistakes

- Using only the mouse screen for tiling while the user works on another display—anchor layout to the focused window when possible, with mouse as fallback.
- Shipping a stale `AppIcon.icns` after editing source art—tie icns regeneration to the same pipeline as release build.
- Running `codesign` before clearing problematic `xattr`, or omitting `PkgInfo` and seeing odd Finder metadata.
- **Grid fill order**: Confirm the product spec is row-major LTR versus column-major; let the last row or column absorb rounding so cells fill `visibleFrame`.
