import type { PluginRow } from "../types/catalog";

const MAX_POPULAR_TAGS = 6;

/** Derive quick-filter chips from plugin names for the hero search row. */
export function derivePopularTags(plugins: PluginRow[]): string[] {
  return plugins.slice(0, MAX_POPULAR_TAGS).map((p) => p.name);
}
