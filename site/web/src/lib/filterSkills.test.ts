import { describe, expect, it } from "vitest";
import type { Skill } from "../types/catalog";
import { filterSkillsByQuery } from "./filterSkills";

const SAMPLE: Skill[] = [
  {
    id: "alpha",
    folder: "alpha",
    path: "plugins/alpha",
    description: "First skill",
    folderUrl: "https://example.com",
    bundleUrl: "",
    copyCommand: "cp a",
    search: "alpha first plugins/alpha",
  },
  {
    id: "beta-tauri",
    folder: "beta",
    path: "plugins/beta",
    description: "Tauri helper",
    folderUrl: "https://example.com/b",
    bundleUrl: "",
    copyCommand: "cp b",
    search: "beta-tauri tauri helper plugins/beta",
  },
];

describe("filterSkillsByQuery", () => {
  it("returns all skills when query is empty", () => {
    expect(filterSkillsByQuery(SAMPLE, "")).toEqual(SAMPLE);
    expect(filterSkillsByQuery(SAMPLE, "   ")).toEqual(SAMPLE);
  });

  it("filters by substring in search blob", () => {
    expect(filterSkillsByQuery(SAMPLE, "tauri")).toHaveLength(1);
    expect(filterSkillsByQuery(SAMPLE, "tauri")[0]?.id).toBe("beta-tauri");
  });

  it("is case-insensitive", () => {
    expect(filterSkillsByQuery(SAMPLE, "ALPHA")).toHaveLength(1);
  });
});
