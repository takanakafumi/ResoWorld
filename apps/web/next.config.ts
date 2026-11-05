import type { NextConfig } from "next";
import { resolve } from "node:path";
import { execSync } from "node:child_process";

const isStaticExport = process.env.STATIC_EXPORT === "true" || process.env.GITHUB_PAGES === "true";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || (process.env.GITHUB_PAGES === "true" ? "/ResoWorld" : "");

let gitCommitSha = process.env.NEXT_PUBLIC_GIT_COMMIT_SHA;
if (!gitCommitSha) {
  try {
    gitCommitSha = execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim();
  } catch {
    gitCommitSha = "dev";
  }
}
const buildTime = new Date().toISOString();

const nextConfig: NextConfig = {
  distDir: process.env.RESOWORLD_NEXT_DIST_DIR || ".next",
  output: isStaticExport ? "export" : undefined,
  basePath: basePath || undefined,
  env: {
    NEXT_PUBLIC_GIT_COMMIT_SHA: gitCommitSha,
    NEXT_PUBLIC_BUILD_TIME: buildTime,
  },
  images: {
    unoptimized: true,
  },
  turbopack: {
    root: resolve(__dirname, "../.."),
  },
};

export default nextConfig;
