import type { Messages } from "./types";

export const zh: Messages = {
  listSep: "、",
  htmlLang: "zh-Hans",
  brandTag: "玲珑 · Claude Code",
  skipLink: "跳到技能目录",
  navAria: "章节导航",
  installTabsAria: "安装方式",
  nav: {
    catalog: "目录",
    plugins: "插件",
    install: "安装",
    overview: "概览",
    quality: "校验",
    github: "GitHub",
    menu: "菜单",
  },
  loading: "正在加载 catalog…",
  error: {
    loadFailed: "无法加载",
    devHint: "本地开发请运行 pnpm dev（会自动 export catalog）。",
  },
  hero: {
    lede:
      "浏览 Claude Code 插件与 skill：在下方搜索，复制安装命令，或一键安装到 Claude Code。",
    searchLabel: "搜索 skill 与插件",
    searchPlaceholder: "按名称、路径或描述搜索…",
    searchHint: "结果会即时显示在下方目录区。",
    popularLabel: "常用：",
    repoBtn: "GitHub 仓库",
    installBtn: "安装指南",
    copyCurlBtn: "复制 curl 安装",
  },
  stats: {
    plugins: "插件",
    skills: "Skill",
    version: "Manifest",
    branch: "分支",
    built: "构建",
  },
  meta: {
    repo: "仓库",
    branch: "分支",
    built: "构建",
    manifest: "Manifest",
    pages: "Pages",
  },
  overview: {
    title: "概览",
    highlight:
      "linglong-marketplace 是面向 Tauri、RFC 工作流与 macOS SwiftPM 的 Claude Code 插件市场。本站托管于",
    highlightSuffix: "；源码在",
    highlightEnd: "。",
    fastest: "最快安装（macOS / Linux，需 Claude CLI）：",
    pluginHint:
      "Claude Code 会话内也可用 /plugin 命令（Git HTTPS 源，不是 Pages URL）。详见下方「安装」。",
    catalogNote: "本页列出 marketplace",
    catalogNoteSuffix:
      " 中的全部 skill 与 plugin。数据来自 .claude-plugin/marketplace.json 与各 SKILL.md。",
    machineReadable: "机器可读：",
  },
  install: {
    title: "安装",
    tabs: {
      quick: "curl / install.sh",
      plugin: "/plugin 命令",
      copySkills: "~/.claude/skills",
    },
    quick: {
      note:
        "标准 plugin marketplace 安装：脚本通过 claude plugin marketplace add 注册 Git 仓库，再 claude plugin install <plugin>@{name}。需已安装 Claude Code CLI。",
      curlHead: "一行命令（推荐）",
      copyCurl: "复制 curl 安装",
      viewScript: "查看 install.sh",
      cloneHead: "克隆后运行 install.sh",
      cloneNote:
        "与 curl 相同：install.sh 使用 Git HTTPS 源注册 marketplace 并安装全部 plugin，不要把本地目录当作 marketplace 源。",
      cliHead: "等价 CLI 命令（install.sh 内部逻辑）",
      copyCli: "复制 CLI 命令",
    },
    plugin: {
      note:
        "在 Claude Code 会话内粘贴以下命令。必须使用 Git HTTPS 仓库地址（与 install.sh 相同），不要使用 Pages URL，也不要注册本地克隆路径。",
      gitSource: "Git 源：",
      stepAdd: "注册 marketplace（远程 Git 仓库）",
      stepInstall: "安装各 plugin（按需可只装部分）",
      copySlash: "复制 /plugin 命令",
      docs: "文档：",
    },
    copySkills: {
      note:
        "高级：不走 plugin marketplace 时，可将 skill 目录复制到全局 ~/.claude/skills（无 plugin 元数据与更新机制）。",
      copyCmd: "复制命令",
    },
  },
  plugins: {
    title: "插件",
    colPlugin: "插件",
    colDesc: "说明",
    colSkills: "Skills",
    skillsUnit: "个 skill",
    browse: "浏览 skill",
  },
  skills: {
    title: "Skill 目录",
    filter: "筛选",
    placeholder: "按名称、路径、描述搜索…",
    source: "源码",
    empty: "没有匹配的 skill。",
    resultCount: "{count} 个 skill",
  },
  quality: {
    title: "本地校验",
    note: "贡献者：推送前请运行与 Husky 相同的检查。",
    copy: "复制",
  },
  footer: {
    branch: "分支",
    backTop: "回顶部",
  },
  copy: {
    unavailable: "剪贴板不可用",
    success: "已复制",
    failed: "复制失败",
  },
  lang: {
    switchToZh: "中文",
    switchToEn: "English",
    label: "语言",
  },
};
