---
name: macos-swiftpm-app-deployer
description: >-
  SwiftPM macOS .app deploy—release build, bundle, codesign, copy to /Applications or DEPLOY_DIR.
  Use when the user runs pnpm run deploy, turbo deploy, deploy.sh, or wants to avoid mistaking pnpm deploy for publish.
  Complements macos-swiftpm-cli-app packaging.
---

# macOS SwiftPM app — build and deploy

## When to apply

- Monorepo or package scripts: `pnpm run build` / `pnpm run deploy` (not bare `pnpm deploy`).
- Copying `build/<Product>.app` to `/Applications` or `$HOME/Applications`.
- Adding or fixing `scripts/deploy.sh`, `turbo.json` `deploy` task, or CI deploy step after `swift build -c release`.

## Preconditions

1. **`Package.swift`**: `executableTarget` (or product) whose **binary name** matches what the pack script copies (for example `Arranger` to `Contents/MacOS/Arranger`).
2. **Pack script** (for example `scripts/build-app.sh`): `swift build -c release`, resolve `--show-bin-path`, assemble `build/<Name>.app` with `Contents/MacOS`, `Contents/Info.plist`, `Contents/Resources` as needed.
3. **Deploy script** (for example `scripts/deploy.sh`): requires **existing** `build/<Name>.app`; `cp -R` to target directory; on failure suggest `sudo` or `DEPLOY_DIR`.

## Standard workflow

1. **Build bundle** (from Swift package root, the folder containing `Package.swift`):

   ```bash
   bash scripts/build-app.sh
   ```

   Or via repo root if wired:

   ```bash
   pnpm run build
   ```

2. **Deploy** (copies prebuilt `.app`):

   ```bash
   pnpm run deploy
   ```

   From repo root with Turborepo, ensure `package.json` defines `"deploy": "turbo run deploy"` and the mac package `deploy` script runs `bash scripts/deploy.sh`. **Do not** use `pnpm deploy` alone—that is pnpm publish flow (`ERR_PNPM_NOTHING_TO_DEPLOY`). Use **`pnpm run deploy`** or **`pnpm --filter <pkg> run deploy`**.

3. **Install location**: Default is often `/Applications`. If permission denied, use a user-writable directory, for example:

   ```bash
   DEPLOY_DIR="${HOME}/Applications" pnpm run deploy
   ```

   Implementations may read a project-specific env var (for example `ARRANGER_DEPLOY_DIR`) or a generic `DEPLOY_DIR`; align the shell script with the README.

## Deploy script checklist

- `set -euo pipefail`
- Resolve `APP_SRC` to the **pack output** path (for example `${ROOT}/build/MyApp.app`)
- If missing, print “run build first” and `exit 1`
- `DEST="${DEPLOY_DIR:-/Applications}"` (or project convention)
- `mkdir -p "$DEST"`; replace existing app: `rm -rf "$DEST/MyApp.app"` then `cp -R "$APP_SRC" "$DEST/"`

## Turborepo

In `turbo.json`, let `deploy` depend on `build` and disable cache:

```json
"deploy": {
  "dependsOn": ["build"],
  "cache": false
}
```

## Verification

- After deploy: `open -a "MyApp"` or launch from Finder.
- If global hotkeys or privacy features misbehave: confirm **`codesign --force --deep --sign -`** ran on the bundle in the build script.

## Related

- Deeper SwiftPM `.app` layout, `Info.plist`, icons, linker `__info_plist`: skill **`macos-swiftpm-cli-app`**.
