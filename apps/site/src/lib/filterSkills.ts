import type { Skill } from "../types/catalog";

/** Client-side filter for the skill grid (matches generated `search` blob). */
export function filterSkillsByQuery(skills: Skill[], rawQuery: string): Skill[] {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return skills;
  return skills.filter((s) => s.search.includes(q));
}
