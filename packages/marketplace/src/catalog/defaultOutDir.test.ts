import { describe, expect, it } from "vitest";

import { defaultCatalogOutDir } from "./defaultOutDir.js";
import { repoRoot } from "../repoRoot.js";

describe("defaultCatalogOutDir", () => {
  it("uses apps/site/public in this monorepo", () => {
    const root = repoRoot();
    expect(defaultCatalogOutDir(root)).toMatch(/apps\/site\/public$/);
  });
});
