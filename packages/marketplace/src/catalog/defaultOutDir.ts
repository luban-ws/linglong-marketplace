import fs from "node:fs";
import path from "node:path";

/** Prefer `apps/site/public` (this monorepo); else `public/` under marketplace root. */
export function defaultCatalogOutDir(marketplaceRoot: string): string {
  const appsSitePublic = path.join(marketplaceRoot, "apps", "site", "public");
  if (fs.existsSync(path.join(marketplaceRoot, "apps", "site"))) {
    return appsSitePublic;
  }
  return path.join(marketplaceRoot, "public");
}
