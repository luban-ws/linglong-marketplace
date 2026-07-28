---
name: velox-development
description: Use this skill for Velox desktop app development, configuration, pnpm CLI integration, Vite or React frontends, macOS app names and icons, native dylib or rpath crashes, code signing, single-instance behavior, and debug or release bundle verification. Trigger when a repo contains velox.json, depends on Velox, invokes the Velox CLI, or produces a Velox-managed .app.
---

# Velox development

Keep Velox in charge. Diagnose broken boundaries before adding glue.

## Start with the pinned implementation

1. Find the resolved Velox checkout, commit, or package version.
2. Read its local README, config model, CLI parser, and bundler code relevant to the task.
3. Inspect `velox.json`, `Package.swift`, package scripts, frontend output, and generated `.app`.
4. Record verified behavior separately from assumptions or behavior seen in another revision.

Do not design from memory when local source is available. Recheck known gaps after every Velox upgrade.

## Make the official CLI the owner

Build Velox's official CLI if the checkout does not already contain it:

```bash
swift build --product velox
```

Expose that binary through pnpm, then call native commands without a shell wrapper:

```json
{
  "scripts": {
    "velox:cli:build": "cd desktop-velox && swift build --product velox",
    "velox": "desktop-velox/.build/checkouts/velox/.build/debug/velox",
    "dev": "pnpm run velox dev",
    "build:app:debug": "pnpm run velox build --debug --bundle",
    "build:app": "pnpm run velox build --bundle"
  }
}
```

Match paths to the repository. Confirm whether pnpm forwards arguments directly; do not insert a literal `--` unless the selected script runner requires it.

Never add `.sh` glue for this workflow. Prefer Velox configuration and hooks. If a verified upstream gap needs orchestration, use a narrow JavaScript or TypeScript adapter invoked by a Velox lifecycle hook.

## Keep configuration ownership clear

- Root `productName` owns user-facing app name.
- Root `identifier` owns bundle identity.
- `app.windows` owns window configuration, not the macOS app icon.
- `bundle.icon` owns packaged icon inputs.
- `build.frontendDist` points to built frontend assets relative to the Velox package root.
- `beforeDevCommand`, `beforeBuildCommand`, and `beforeBundleCommand` are framework lifecycle boundaries.
- `bundle.resources` declares additional runtime files copied into the app.
- `bundle.macos.signingIdentity` requests final app signing when supported by the pinned version.

Keep internal Swift target and executable names stable unless renaming them solves a real problem. User-facing `Cleaning.app` can still contain an internal executable named `CleanSpaceDesktop`.

## Diagnose Dock icon failures correctly

`swift run <target>` launches a bare executable. Finder and Dock cannot treat it as a complete macOS application bundle, so a generic executable icon is expected. Setting `NSApplication.shared.applicationIconImage` is not a replacement for packaging.

Use Velox to build `.app`, verify `CFBundleIconFile`, confirm the `.icns` exists in `Contents/Resources`, then launch the bundle with `open`. Do not claim icon completion from source PNG hashes alone.

## Treat native runtime libraries as bundle data

For a launch crash such as:

```text
Library not loaded: /absolute/build/path/libvelox_runtime_wry_ffi.dylib
```

inspect the executable first:

```bash
otool -L path/to/App.app/Contents/MacOS/Executable
```

Every non-system dependency must be inside the app or deliberately supplied by the OS. Its load command must use a relocatable install name such as:

```text
@executable_path/../Resources/libvelox_runtime_wry_ffi.dylib
```

Velox commit `f9a37edbac01b160c574e96c46b084a01da1ecf8` did not automatically copy and rewrite this FFI dylib in the observed SwiftPM plugin build. Verify current source and output before applying the workaround in [macOS bundle runtime](references/macos-bundle-runtime.md).

## Preserve app identity in single-instance code

Derive notification, lock, or activation namespaces from `Bundle.main.bundleIdentifier`, with the production identifier only as fallback. This keeps packaged identity canonical while retaining test and bare-run behavior.

Do not secretly swap `velox.json` to manufacture different Debug and Release product names. If pinned Velox has no build-mode `productName` override, keep one app name in separate output directories or propose upstream support.

## Acceptance ladder

Stop at first failed boundary:

1. Velox CLI command exits successfully and creates expected `.app`.
2. `Info.plist` reports product name, bundle identifier, executable, icon, and minimum OS version.
3. Icon and frontend assets exist inside bundle.
4. `otool -L` contains no developer-machine absolute paths.
5. Every non-system native library exists at its resolved bundle location.
6. `codesign --verify --deep --strict --verbose=2` passes.
7. `open App.app` launches a stable process with expected bundle identifier.
8. Second launch exercises single-instance wake behavior when required.
9. Dock visibly shows expected app name and icon after full quit and relaunch.

Compiler and unit-test success are supporting evidence, not bundle acceptance. Report any unverified visual check explicitly.
