import path from "node:path";
import { describe, expect, it } from "vitest";

import { discoverPluginRoots, discoverSkillDirs, pluginsRoot } from "./paths.js";
import { linglongMarketplaceRoot } from "./testFixtures.js";

describe("plugin layout", () => {
  const base = linglongMarketplaceRoot();
  const pluginsDir = pluginsRoot(base);

  it("discovers four plugin packages", () => {
    const roots = discoverPluginRoots(pluginsDir);
    const names = roots.map((p) => path.basename(p)).sort();
    expect(names).toEqual([
      "macos-swiftpm-plugin",
      "rfc-plugin",
      "tauri-plugin",
      "vite-github-pages-plugin",
    ]);
  });

  it("finds six skills total", () => {
    const roots = discoverPluginRoots(pluginsDir);
    const total = roots.reduce(
      (n, r) => n + discoverSkillDirs(r).length,
      0,
    );
    expect(total).toBe(6);
  });
});
