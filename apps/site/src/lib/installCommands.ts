import type { SiteCatalog } from "../types/catalog";

/** In-session slash commands for Claude Code. */
export function buildClaudeInstallCommands(catalog: SiteCatalog): string {
  const lines = [
    `/plugin marketplace add ${catalog.cloneUrl}`,
    ...catalog.plugins.map(
      (p) => `/plugin install ${p.name}@${catalog.marketplaceName}`,
    ),
  ];
  return lines.join("\n");
}

/** curl | sh one-liner (raw GitHub — common marketplace pattern). */
export function buildCurlInstallCommand(catalog: SiteCatalog): string {
  return `curl -fsSL ${catalog.installScriptRawUrl} | sh`;
}

/** Same script served from GitHub Pages. */
export function buildCurlInstallFromPages(catalog: SiteCatalog): string {
  return `curl -fsSL ${catalog.installScriptPagesUrl} | sh`;
}

/** Claude CLI equivalent of the install script. */
export function buildCliInstallCommands(catalog: SiteCatalog): string {
  const lines = [
    `claude plugin marketplace add ${catalog.cloneUrl}`,
    ...catalog.plugins.map(
      (p) => `claude plugin install ${p.name}@${catalog.marketplaceName}`,
    ),
  ];
  return lines.join("\n");
}

/** Human-readable Pages browse URLs (copy helper). */
export function buildGhPagesBrowseLines(catalog: SiteCatalog): string[] {
  return [
    catalog.pagesUrl,
    catalog.pagesCatalogUrl,
    catalog.pagesManifestUrl,
  ];
}
