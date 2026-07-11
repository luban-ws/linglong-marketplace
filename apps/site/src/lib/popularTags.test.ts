import { describe, expect, it } from "vitest";
import { derivePopularTags } from "./popularTags";

describe("derivePopularTags", () => {
  it("returns plugin names capped at six", () => {
    const plugins = Array.from({ length: 8 }, (_, i) => ({
      name: `plugin-${i}`,
      description: "",
      skillCount: 1,
    }));
    expect(derivePopularTags(plugins)).toEqual([
      "plugin-0",
      "plugin-1",
      "plugin-2",
      "plugin-3",
      "plugin-4",
      "plugin-5",
    ]);
  });

  it("returns empty array when no plugins", () => {
    expect(derivePopularTags([])).toEqual([]);
  });
});
