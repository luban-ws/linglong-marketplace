import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const repo = process.env.GITHUB_REPOSITORY ?? "";
const defaultBase = repo.includes("/") ? `/${repo.split("/")[1]}/` : "/";

export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE || defaultBase,
  build: {
    outDir: process.env.LINGLONG_SITE_OUT
      ? path.resolve(process.env.LINGLONG_SITE_OUT)
      : path.resolve(__dirname, "../../_site"),
    emptyOutDir: true,
  },
  test: {
    environment: "jsdom",
    globals: true,
  },
});
