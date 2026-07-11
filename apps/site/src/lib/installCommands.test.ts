import { describe, expect, it } from "vitest";
import type { SiteCatalog } from "../types/catalog";
import {
  buildClaudeInstallCommands,
  buildCurlInstallCommand,
  buildCurlInstallFromPages,
  buildGhPagesBrowseLines,
} from "./installCommands";

const SAMPLE: SiteCatalog = {
  marketTitle: "linglong-marketplace",
  metaDescription: "demo",
  version: "1.0.0",
  generatedAt: "2026-01-01T00:00:00Z",
  repository: "systembugtj/linglong-marketplace",
  sourceBranch: "main",
  cloneUrl: "https://github.com/systembugtj/linglong-marketplace.git",
  repoName: "linglong-marketplace",
  marketplaceName: "linglong-marketplace",
  pagesUrl: "https://systembugtj.github.io/linglong-marketplace/",
  pagesCatalogUrl:
    "https://systembugtj.github.io/linglong-marketplace/catalog.json",
  pagesManifestUrl:
    "https://systembugtj.github.io/linglong-marketplace/manifest.json",
  marketplaceManifestRawUrl:
    "https://github.com/systembugtj/linglong-marketplace/raw/main/.claude-plugin/marketplace.json",
  repositoryUrl: "https://github.com/systembugtj/linglong-marketplace",
  installScriptRawUrl:
    "https://github.com/systembugtj/linglong-marketplace/raw/main/install.sh",
  installScriptPagesUrl:
    "https://systembugtj.github.io/linglong-marketplace/install.sh",
  plugins: [
    { name: "tauri-plugin", description: "tauri", skillCount: 1 },
    { name: "rfc-plugin", description: "rfc", skillCount: 2 },
  ],
  skills: [],
};

describe("buildClaudeInstallCommands", () => {
  it("includes marketplace add and per-plugin install", () => {
    const cmd = buildClaudeInstallCommands(SAMPLE);
    expect(cmd).toContain(
      "/plugin marketplace add https://github.com/systembugtj/linglong-marketplace.git",
    );
    expect(cmd).toContain(
      "/plugin install tauri-plugin@linglong-marketplace",
    );
    expect(cmd).toContain("/plugin install rfc-plugin@linglong-marketplace");
  });
});

describe("buildCurlInstallCommand", () => {
  it("uses raw install.sh URL", () => {
    const cmd = buildCurlInstallCommand(SAMPLE);
    expect(cmd).toBe(
      "curl -fsSL https://github.com/systembugtj/linglong-marketplace/raw/main/install.sh | sh",
    );
  });
});

describe("buildCurlInstallFromPages", () => {
  it("uses Pages-hosted install.sh", () => {
    const cmd = buildCurlInstallFromPages(SAMPLE);
    expect(cmd).toContain("systembugtj.github.io/linglong-marketplace/install.sh");
  });
});

describe("buildGhPagesBrowseLines", () => {
  it("lists pages URLs", () => {
    const lines = buildGhPagesBrowseLines(SAMPLE);
    expect(lines[0]).toContain("systembugtj.github.io/linglong-marketplace");
    expect(lines[1]).toContain("catalog.json");
    expect(lines[2]).toContain("manifest.json");
  });
});
