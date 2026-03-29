# macOS SwiftPM → .app 组装（参考）

## 目录约定（示例）

- `Package.swift`
- `Sources/<Executable>/`
- `Sources/<Library>/`（可选）
- `Tests/<Target>/`
- `Resources/Info.plist`（及图标源文件、菜单栏 PNG 等）
- `scripts/build-app.sh`
- `build/` → 本地 `.app`，gitignore

## build-app.sh 顺序

1. `swift build -c release`
2. `BIN="$(swift build -c release --show-bin-path)/<Executable>"`
3. `rm -rf Target.app && mkdir -p Target.app/Contents/MacOS`
4. `cp "$BIN" Target.app/Contents/MacOS/<Executable>`，`chmod +x`
5. `cp Resources/Info.plist Target.app/Contents/Info.plist`
6. `mkdir -p Target.app/Contents/Resources`；复制 `AppIcon.icns`、菜单栏图片等
7. `printf 'APPL????' > Target.app/Contents/PkgInfo`（固定 8 字节）
8. `xattr -cr Target.app`（在 codesign **之前**）
9. `codesign --force --deep --sign - Target.app`（临时签名用 `-`）

## Info.plist 要点

- `CFBundleIdentifier`、`CFBundleExecutable`、`CFBundlePackageType` APPL
- Accessory：`LSUIElement` = true，与 `NSApplication.setActivationPolicy(.accessory)` 一致
- 图标：`CFBundleIconFile` = `AppIcon`（无后缀），对应 `Resources/AppIcon.icns`
- 辅助功能：`NSAccessibilityUsageDescription`（若使用 AX API）

## 嵌入 plist（可选，便于 Xcode Run Mach-O）

在 `executableTarget` 的 `linkerSettings` `.unsafeFlags`（仅 macOS）：

` -Xlinker -sectcreate -Xlinker __TEXT -Xlinker __info_plist -Xlinker Resources/Info.plist`

路径相对于包根目录。

## 图标

- 主图正方形（如 1024×1024）→ `iconutil` 生成 `AppIcon.icns`
- **每次**发布构建前如改了主图，应重新跑 icns 生成，再打包

## pnpm / turbo

`package.json`：`"build": "bash scripts/build-app.sh"`，`"test": "swift test"`（可加资源校验脚本）。根 `turbo.json` 声明任务依赖；`build/` 不提交。

## 从 Xcode 工程迁出

1. 源码迁入 SPM `Sources/`，保留同一 Bundle ID 与关键 plist 键
2. 脚本可稳定产出等价 `.app` 后，再弱化或移除 `.xcodeproj`
3. CI 从 `xcodebuild test` 迁到 `swift test`；需 Archive 时再保留或新建 Xcode 发布用工程
