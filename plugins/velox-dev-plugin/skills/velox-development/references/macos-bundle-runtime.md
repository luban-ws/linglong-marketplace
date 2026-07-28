# macOS bundle runtime repair

Use this only after pinned Velox source and generated output prove the bundler omitted or mislinked a required native library.

## Minimal repair boundary

Keep Velox as bundler. Add a JavaScript adapter to `beforeBundleCommand` that:

1. Resolves Debug or Release from the environment supplied by Velox.
2. Finds the built `libvelox_runtime_wry_ffi.dylib` deterministically.
3. Copies it into a stable staging directory.
4. Rewrites the app executable load command before Velox copies the executable:

```bash
install_name_tool -change \
  /absolute/build/path/libvelox_runtime_wry_ffi.dylib \
  @executable_path/../Resources/libvelox_runtime_wry_ffi.dylib \
  path/to/Executable
```

5. Ad-hoc signs modified Mach-O inputs if macOS rejects altered signatures.
6. Declares the staged dylib in `bundle.resources` so Velox copies it.
7. Lets Velox perform final app-bundle signing through `bundle.macos.signingIdentity`.

Do not copy the whole Velox bundler into project code. Do not search arbitrary DerivedData trees at runtime. Fail with a clear error if zero or multiple candidate dylibs exist.

## Evidence commands

```bash
plutil -p App.app/Contents/Info.plist
otool -L App.app/Contents/MacOS/Executable
find App.app/Contents -type f -maxdepth 3 -print
codesign --verify --deep --strict --verbose=2 App.app
open App.app
pgrep -afil Executable
```

For ad-hoc development signing, `signingIdentity: "-"` is acceptable when confirmed by pinned Velox. Distribution builds need the project's real signing identity, entitlements, hardened runtime, and notarization policy.

## Remove workaround when upstream closes gap

After upgrading Velox:

1. Remove adapter in a branch.
2. Build both Debug and Release bundles with official CLI.
3. Repeat full acceptance ladder.
4. Delete workaround only when Velox itself copies, relocates, and signs dependency correctly.
