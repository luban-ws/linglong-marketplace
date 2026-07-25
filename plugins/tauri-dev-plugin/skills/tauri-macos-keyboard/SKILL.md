---
name: tauri-macos-keyboard
description: Use this skill when F-keys (especially F7/F8) or other shortcuts work in browser dev but not in a Tauri macOS shell, when `tauri-plugin-global-shortcut` registration appears successful yet nothing fires, when diagnosing why a File menu vanishes from the menu bar, when WebView `keydown` handlers never see bare function keys on MacBook hardware, or when choosing between NSMenu accelerators, global shortcuts, and frontend keyboard listeners in Tauri v2.
---

# Tauri v2 keyboard shortcuts on macOS

Distilled from a real incident where F7/F8 (new folder / delete) worked in Playwright mock E2E and Jest but **never fired in the real Tauri app** on macOS. Verified against Tauri v2 menu docs, `tauri-plugin-global-shortcut` 2.3.x, and `global-hotkey` 0.7.x macOS platform code — not folklore.

## Core fact: three independent keyboard paths

On macOS a Tauri app can receive the "same" user intent through **three unrelated subsystems**. Fixing only one while the others are wrong produces "it works in tests but not in the app" bugs.

| Path | When it fires | Typical failure on MacBook |
|------|----------------|----------------------------|
| **WebView `keydown`** | Focus inside web content; React/Vanilla listeners | Bare F7/F8 often **never arrive** (media-key mode) |
| **NSMenu accelerators** (`MenuItemBuilder::accelerator`) | App is focused; menu item has `.accelerator("F7")` | Works for fn+F7 or "Use F1/F2 as standard function keys"; still best for app-focused shortcuts |
| **`tauri-plugin-global-shortcut`** | OS-level hotkey registration | `Code::F7` alone misses **media-key mode**; media keys need `Code::MediaRewind` / `MediaPlayPause` |

**Do not claim F7/F8 are fixed after Playwright or Vite-only tests.** Mock environments inject `KeyboardEvent` directly; they do not reproduce macOS media-key routing or NSMenu accelerator handling. Validate in `tauri dev` / installed `.app`.

## MacBook function keys: two physical modes

Apple hardware defaults to **media-key mode** unless the user enables *Keyboard → Keyboard → "Use F1, F2, etc. keys as standard function keys"*.

| User presses | Standard mode (`Code`) | Media-key mode (default on many MacBooks) |
|--------------|------------------------|-------------------------------------------|
| F7 | `F7` (scancode `0x62`) | `MediaRewind` (NX_KEYTYPE Rewind) |
| F8 | `F8` (scancode `0x64`) | `MediaPlayPause` (NX_KEYTYPE Play) |

`global-hotkey` on macOS implements this split explicitly:
- **RegisterEventHotKey** handles scancode-based keys (`F7`, `F8`, modifiers).
- **CGEventTap** (`SystemDefined` events) handles registered **media** codes (`MediaRewind`, `MediaPlayPause`, etc.).

Registering only `Shortcut::new(None, Code::F7)` is **insufficient** for MacBook users in media-key mode. Also register:

```rust
#[cfg(target_os = "macos")]
{
    register(Shortcut::new(None, Code::MediaRewind), "create-dir");
    register(Shortcut::new(None, Code::MediaPlayPause), "delete");
    register(
        Shortcut::new(Some(Modifiers::SHIFT), Code::MediaPlayPause),
        "delete-permanent",
    );
}
```

**Trade-off:** `MediaPlayPause` as a global shortcut intercepts the system play/pause key while your app has registered it (global-hotkey returns `null` from the event tap to consume the event). Acceptable for file-manager-style apps; avoid for music players unless the product owner agrees.

**Accessibility:** media-key watching uses `CGEventTapCreate`. If registration fails with media-key errors, macOS may require **Privacy & Security → Accessibility** permission for the app. Log per-shortcut registration failures; do not fail app startup on a single hotkey.

## NSMenu accelerators (app-focused path)

Tauri docs: set `.accelerator("F7")` on `MenuItemBuilder`; the runtime wires the shortcut and fires `on_menu_event` when the app is focused — **without** relying on WebView `keydown`.

```rust
MenuItemBuilder::with_id("create-dir", "New Folder")
    .accelerator("F7")
    .build(app)?;
```

Bridge menu events to the frontend with a single event name (e.g. `menu-action`) and keep IDs aligned with a shared contract in Rust + TypeScript.

**Always provide a menu + toolbar fallback** for function keys on macOS; do not assume bare F7 is universal.

## Menu bar layout trap (missing "File" menu)

On macOS the menu bar root may only contain **submenus**. Tauri docs: the **first** submenu is merged under the application menu (the app name), regardless of its `text` label.

| Wrong (File first) | Correct |
|--------------------|---------|
| `File, Edit, View…` → File items live under app name; no **File** in bar | `App (About/Hide/Quit + optional duplicates), File, Edit, View…` |

Pattern:

1. First submenu: app menu (`.about()`, `.hide()`, `.quit()`, optional file commands with **distinct ids** e.g. `create-dir-app` if duplicated).
2. Second submenu: `File` (English title is stable on macOS).
3. Do **not** duplicate the same menu item id in two submenus — use `-app` suffix and map to canonical ids in `on_menu_event`.

Avoid duplicating **the same Cmd accelerators** on both app-menu copies and File-menu items; duplicate accelerators have caused File submenu display issues in production.

## `tauri-plugin-global-shortcut` setup checklist

1. **Cargo** (desktop targets only):

```toml
[target.'cfg(not(any(target_os = "android", target_os = "ios")))'.dependencies]
tauri-plugin-global-shortcut = "2"
```

2. **Plugin** in `lib.rs`:

```rust
.plugin(tauri_plugin_global_shortcut::Builder::new().build())
```

3. **Capabilities** — include in `capabilities/default.json` (and a desktop-specific capability if used):

```json
"global-shortcut:default"
```

Or explicit allows: `global-shortcut:allow-register`, `global-shortcut:allow-unregister`, `global-shortcut:allow-is-registered`.

4. **Register in `setup`** — prefer `on_shortcut` in Rust for file-op keys; register **each** shortcut independently and `log::warn!` on failure so one bad key does not abort the rest.

5. **Emit to frontend** — `app.emit("menu-action", "create-dir")` and `listen("menu-action", …)` in the renderer. Reuse the same handler for menu clicks and global shortcuts.

## Frontend keyboard hook (secondary)

A focused-pane `window.addEventListener("keydown", …)` is still useful for Windows/Linux and for macOS users in standard-function-key mode. Normalize F-keys (`e.key` vs `e.code`) because WebView reporting is inconsistent.

This layer is **supplementary** on macOS — not sufficient alone for F7/F8.

## Debugging workflow (agent-friendly)

1. Reproduce in **`tauri dev`**, not `vite dev` alone.
2. Check Rust logs for `全局快捷键注册失败` / per-shortcut warn lines.
3. Confirm menu shows **File →** item with F7 in the shortcut column (app focused).
4. Test both: bare F7 and **fn+F7**.
5. If media keys still dead: verify Accessibility permission; confirm `MediaRewind` / `MediaPlayPause` registrations in Rust.
6. After changing `menu.rs`, **Cmd+Q** quit — relaunch; stale processes keep old menus.

## When global-shortcut is not enough

System-reserved shortcuts (Mission Control, Dictation, some media keys) cannot be overridden with `RegisterEventHotKey`. Options (macOS-only, heavier):

- `tauri-plugin-macos-input-monitor` (CGEventTap at head insert, hardware-level)
- Change product shortcuts (e.g. `Cmd+Shift+N` for new folder on Mac)
- Document fn+F7 / standard-function-keys setting for users

## Implementation checklist

- [ ] File submenu is **second** on macOS (app submenu first)
- [ ] File menu items use `.accelerator("F7")` / `"F8"` / `"Shift+F8"`
- [ ] Global shortcuts: `F7`, `F8`, `Shift+F8` **plus** macOS `MediaRewind` / `MediaPlayPause` variants
- [ ] `on_menu_event` + `menu-action` event bridge to frontend
- [ ] Toolbar buttons as fallback
- [ ] Tests: Jest for handler logic; **smoke in real Tauri shell** for shortcut acceptance
- [ ] Do not remove menu accelerators and rely only on WebView `keydown` on macOS

**See also**: `tauri-project` for monorepo/`src-tauri` layout; `tauri-dev-prod-isolation` for dev/prod config overlays (unrelated to keys but same "works in dev, wrong in shell" debugging shape).
