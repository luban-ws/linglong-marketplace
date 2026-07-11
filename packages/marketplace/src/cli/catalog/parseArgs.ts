export const CLI_NAME = "ll-catalog";
export const PACKAGE_NAME = "@linglongjs/marketplace-build";
export const VERSION = "1.0.0";

export type CatalogCliOptions = {
  help: boolean;
  version: boolean;
  path: string | null;
  outDir: string | null;
};

export function parseCatalogCliArgs(argv: string[]): CatalogCliOptions {
  let help = false;
  let version = false;
  let path: string | null = null;
  let outDir: string | null = null;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") {
      help = true;
      continue;
    }
    if (arg === "--version" || arg === "-V") {
      version = true;
      continue;
    }
    if (arg === "--out" || arg === "-o") {
      const next = argv[i + 1];
      if (!next || next.startsWith("-")) {
        throw new Error("missing value for --out");
      }
      outDir = next;
      i += 1;
      continue;
    }
    if (arg === "--path" || arg === "-p") {
      const next = argv[i + 1];
      if (!next || next.startsWith("-")) {
        throw new Error("missing value for --path");
      }
      path = next;
      i += 1;
      continue;
    }
    if (arg.startsWith("-")) {
      throw new Error(`unknown option: ${arg}`);
    }
    if (path !== null) {
      throw new Error(`unexpected argument: ${arg}`);
    }
    path = arg;
  }

  return { help, version, path, outDir };
}

export function formatCatalogHelp(): string {
  return `ll-catalog — build catalog.json and manifest.json for a marketplace site

Usage:
  ll-catalog                    export catalog (auto-finds marketplace root)
  ll-catalog -o <dir>           write JSON files to dir
  ll-catalog <path>             marketplace repo root

Options:
  -h, --help                    show help
  -V, --version                 show version
  -p, --path <dir>              marketplace root
  -o, --out <dir>               output directory (default: apps/site/public or public/)

Examples:
  pnpm catalog
  ll-catalog
  ll-catalog -o ./apps/site/public
  npx ${PACKAGE_NAME}
`;
}
