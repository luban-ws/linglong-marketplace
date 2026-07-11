import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const SITE_DEV_PORT = 5181;
const SITE_PREVIEW_PORT = 5182;

const repo = process.env.GITHUB_REPOSITORY ?? "";
const defaultBase = repo.includes("/") ? `/${repo.split("/")[1]}/` : "/";

export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE || defaultBase,
  server: { port: SITE_DEV_PORT, strictPort: true },
  preview: { port: SITE_PREVIEW_PORT, strictPort: true },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  test: {
    environment: "jsdom",
    globals: true,
  },
});
