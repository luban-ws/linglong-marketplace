---
name: tauri-dev-prod-isolation
description: Use this skill whenever a Tauri v2 app needs dev and prod builds to run side-by-side on the same machine without clobbering each other's data, when diagnosing why two Tauri instances share state/locks/updater traffic they shouldn't, when setting up a `tauri.dev.conf.json` config overlay, when configuring or debugging `tauri-plugin-updater` (`createUpdaterArtifacts`, `pubkey`, `endpoints`, GitHub Releases as update backend), or when generating/signing Tauri updater keys with `tauri signer generate` and hitting non-interactive/CI signing failures.
---

# Tauri dev/prod isolation and updater signing

Distilled from real production incidents fixing a Tauri app's release pipeline and dev/prod coexistence. Every claim below was verified against actual plugin source code or reproduced locally — treat this as ground truth for Tauri v2, not folklore.

## Core fact: `identifier` is the isolation boundary

Everything in this skill traces back to one fact: **`tauri.conf.json`'s `identifier` field is what several independent subsystems key off of.** Two builds sharing an `identifier` share more state than most people expect:

1. **`app_data_dir()`** — derived from `identifier`. macOS: `~/Library/Application Support/{identifier}`. Same identifier = same `preferences.json`, same on-disk DB, same queue files. Two processes with the same identifier running concurrently **will corrupt each other's data**, not just "look confusing."
2. **`tauri-plugin-single-instance`** — verified by reading the plugin's actual source (v2.4.1) across all three platforms:
   - macOS (`platform_impl/macos.rs`): `socket_path()` builds `/tmp/{identifier}_si.sock` from `config.identifier`.
   - Windows (`platform_impl/windows.rs`): builds a mutex name `{identifier}-sim` from `app.config().identifier`, passed to `CreateMutexW`.
   - Linux (`platform_impl/linux.rs`): builds a D-Bus service name `{identifier}.SingleInstance` from `app.config().identifier`.
   All three read `identifier` directly from the runtime config at plugin `setup()` time — no extra wiring needed in `main.rs`. **This means: give dev and prod different identifiers, and single-instance locking is automatically scoped per-channel with zero Rust code changes.** Do not assume this for other plugins without checking their source the same way — this pattern is common in Tauri plugins but not universal.
3. **`tauri-plugin-updater`** — does **NOT** read `identifier` at all. If a plugin is registered unconditionally in `main.rs` (common pattern: register once, works for both dev and prod), and it runs a periodic background check task, a dev build with no endpoint override will happily poll the **production** update feed. This is a real failure mode, not theoretical: a running dev instance can be prompted to "update" itself into the prod installer. **Fix: explicitly zero out `plugins.updater.endpoints: []` in the dev config overlay.** Identifier isolation does not cover this — it's an unrelated subsystem that needs its own override.

**General principle when adding a new dev/prod split**: don't assume a subsystem respects `identifier` isolation just because data-dir and single-instance do. Check each Tauri plugin your app registers unconditionally in `main.rs` — anything with a background task or network call is a candidate for the same "dev silently talks to prod" bug. Read the plugin's source for what it keys its behavior on; don't guess.

## Config overlay pattern (`--config`)

Tauri v2's CLI supports `--config <path>` on both `tauri dev` and `tauri build`, which overlays a partial JSON config on top of `tauri.conf.json`. This is the right mechanism for a dev/prod split — don't maintain two full config files.

```json
// tauri.dev.conf.json — minimal overlay, not a full config
{
    "productName": "MyApp Dev",
    "identifier": "com.example.myapp.dev",
    "app": { "windows": [{ "title": "MyApp (Dev)" }] },
    "plugins": { "updater": { "endpoints": [] } }
}
```

```json
// package.json
{
    "scripts": {
        "dev": "tauri dev --config src-tauri/tauri.dev.conf.json",
        "build:debug": "tauri build --debug --config src-tauri/tauri.dev.conf.json"
    }
}
```

**Unverified merge semantics — spike before relying on this**: whether `--config` does a deep or shallow merge on nested arrays (e.g. `app.windows`) is not something to assume. If the merge is shallow (array replacement, not per-field merge), an overlay that only specifies `title` will silently drop `width`/`height`/other window fields from the base config. **Before writing the real overlay file, run one manual `tauri dev --config <overlay>` with a minimal overlay and inspect whether unrelated fields from the base config survived.** This is a five-minute check that prevents a real bug (windows launching in default size).

**CI must never load the dev overlay.** Enforce this two ways, not one:
- A repo-level test (Vitest/Jest, no Tauri runtime needed) that parses both config JSONs and asserts `devConfig.identifier !== baseConfig.identifier`, and that CI-only scripts (e.g. a `*:ci` script) don't reference the dev overlay file or its identifier string.
- A CI-runtime grep gate (a build step, not just a test) that fails if `.github/workflows/**` or any prod-path script references the dev config filename. The test can be skipped by a flaky CI run; the build-time grep can't.

## Updater signing key generation — non-interactive environment bug

Real bug hit while generating `tauri-plugin-updater` signing keys for CI: **`tauri signer generate` with a passwordless key fails when signing runs in a non-interactive terminal** (any CI runner, or a Bash-tool subprocess), with an opaque error:

```
failed to decode secret key: incorrect updater private key password: Device not configured (os error 6)
```

This happens regardless of how "no password" is requested — `--ci` flag, `-p ""`, or leaving `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` unset all hit the same bug in `tauri-cli` 2.9.6. The CLI internally still attempts an interactive password prompt at sign-time even when the key claims to be passwordless, and that prompt has no TTY to read from in CI.

**Fix: always generate keys with a real, non-empty password.**

```bash
pnpm tauri signer generate -w ~/.tauri/myapp.key -p "<real-password>"
```

Store the private key content in `TAURI_SIGNING_PRIVATE_KEY` (CI secret) and the password in `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` (CI secret). The public key is not sensitive — commit it directly into `tauri.conf.json`'s `plugins.updater.pubkey`, don't inject it via CI templating; that's one less moving part and one less way to ship a build with an empty pubkey.

**Verify locally before trusting CI**: run a full `tauri build` (release profile) locally with both env vars set to the real key/password, and confirm the bundle output includes `<bundle>.sig` (or equivalent). This is a five-minute check that catches "wrong password" or "key/pubkey mismatch" before a CI round-trip.

## `createUpdaterArtifacts` — the silent no-op

`tauri.conf.json`'s `bundle.createUpdaterArtifacts` defaults to `false` and most Tauri getting-started guides don't mention it prominently. Without it set to `true`:
- `tauri build` / `tauri-action` produce normal installers but **no signed updater artifact** (`.sig`, `latest.json`).
- Every other piece of updater config (`pubkey`, `endpoints`, CI signing secrets) can be perfectly correct and the updater will still never find anything to download — the endpoint URL 404s.
- **This fails silently.** CI shows green (the build succeeded), the release publishes normally, and only a live client checking for updates reveals the gap.

**Mitigation**: after any release-producing CI step, add an explicit assertion (e.g. `gh release view <tag> --json assets --jq '.assets[].name' | grep -qx latest.json`) that fails the build if the updater artifact is missing. Don't rely on "the build succeeded" as evidence the updater artifact exists — those are different claims.

## Checklist for a new Tauri dev/prod split

1. Read the actual source of every unconditionally-registered plugin in `main.rs` — don't assume identifier isolation extends to plugins you haven't checked (updater is the known exception; there may be others).
2. Spike `--config` merge semantics with a minimal overlay before writing the real one.
3. Write the overlay file with only the fields that actually need to differ — resist copying the whole base config "to be safe."
4. Add both a static test (parse configs, assert identifiers differ) and a CI-runtime grep gate (dev config never referenced in release/CI scripts) — they catch different failure paths, keep both.
5. For updater-enabled apps: explicitly zero `plugins.updater.endpoints` in the dev overlay, and verify `bundle.createUpdaterArtifacts: true` is set in the base config, not assumed.
6. When generating signing keys for CI, use a real password from the start — don't discover the passwordless-key CI bug the hard way.
7. Document the "existing local dev data won't migrate when identifier changes" gotcha loudly (PR description, not just a Risks section nobody reads) — every existing contributor's dev environment resets to empty on first pull of an identifier change.

**See also**: `tauri-theme-management` for prod-only theming bugs (different subsystem, same "works in dev, breaks in `tauri build`" failure shape); `tauri-project` for pnpm monorepo conventions if this app lives in one.
