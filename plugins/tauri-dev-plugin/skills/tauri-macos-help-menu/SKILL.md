---
name: tauri-macos-help-menu
description: Use this skill when a Tauri v2 macOS Help menu is empty, shows only the system Search field, omits custom items such as Report Issue, behaves differently across muda versions, or receives menu data asynchronously from a frontend.
---

# Tauri v2 macOS Help menu

Use evidence before native workarounds. macOS showing **Search** proves AppKit recognized a Help menu. It does not prove custom frontend data reached Rust or that Rust installed those items.

## Known-good baseline

- Use `muda 0.17.2` or newer. `0.17.1` had a macOS Help-menu registration regression fixed by [muda PR #335](https://github.com/tauri-apps/muda/pull/335).
- Confirm resolved dependency, not only `Cargo.toml`:

```bash
cargo tree -i muda
```

- Give Help submenu Tauri's reserved ID:

```rust
use tauri::menu::{MenuBuilder, SubmenuBuilder, HELP_SUBMENU_ID};

let help = SubmenuBuilder::with_id(app, HELP_SUBMENU_ID, "Help")
    .item(&report_issue)
    .separator()
    .item(&learn_more)
    .build()?;

let menu = MenuBuilder::new(app).item(&help).build()?;
app.set_menu(menu)?;
```

Build custom children normally, then install root menu once. Tauri uses `HELP_SUBMENU_ID` to register Help with NSApp. Do not add private AppKit calls unless runtime evidence reaches native installation intact.

## Evidence ladder

Stop at first broken boundary:

1. Confirm running process uses rebuilt Tauri binary and expected `muda` version.
2. Log top-level menu keys and Help child IDs immediately before frontend `invoke`.
3. Log same values at Rust command entry.
4. After building submenu, inspect `help.items()?`.
5. After `set_menu`, inspect `app.menu()` and submenu with `HELP_SUBMENU_ID`.
6. Only when all layers contain custom IDs but UI still shows Search, create minimal muda/Tauri reproduction and inspect AppKit.

Propagate or log every `Result`. `let _ = ...` destroys boundary evidence.

## Startup ordering

Dynamic/localized menus may legitimately originate in frontend. Preserve that architecture. Start initial menu synchronization before unrelated asynchronous startup work:

```typescript
onMounted(async () => {
  refreshSystemMenu(t);
  await loadThemes();
  await startOtherServices();
});
```

If refresh returns a promise, await it. If it deliberately starts a background request, attach error logging inside that API. In both designs, call it before theme, telemetry, database, or scan awaits; any earlier rejection can otherwise leave Rust with default or empty Help forever. Static menu definitions in source prove nothing about runtime delivery.

Do not move dynamic menu ownership into Rust `setup` merely to hide a missed invoke. Fix broken boundary.

## Failed-workaround blacklist

Do not try these before evidence ladder completes:

- Rename Help title while keeping wrong ID.
- Install empty Help, then append children.
- Disable Tauri's default menu or perform Objective-C NSMenu surgery.
- Blame AppKit because frontend model contains items.
- Accept Vite, mock, or unit tests as real menu verification.

These add special cases while preserving root cause.

## Acceptance

Verify in real `tauri dev` or installed app after full quit/relaunch:

- Help shows Search plus every expected custom item.
- Custom item click reaches canonical menu-event handler.
- Startup still installs menu when unrelated initialization fails.
- `cargo tree -i muda` reports intended version.

Keep temporary boundary logs until visible menu and click path pass, then remove them.
