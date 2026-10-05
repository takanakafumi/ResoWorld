import type { NextConfig } from "next";
import { resolve } from "node:path";

const isStaticExport = process.env.STATIC_EXPORT === "true" || process.env.GITHUB_PAGES === "true";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || (process.env.GITHUB_PAGES === "true" ? "/ResoWorld" : "");

const nextConfig: NextConfig = {
  distDir: process.env.RESOWORLD_NEXT_DIST_DIR || ".next",
  output: isStaticExport ? "export" : undefined,
  basePath: basePath || undefined,
  images: {
    unoptimized: true,
  },
  turbopack: {
    root: resolve(__dirname, "../.."),
  },
};

export default nextConfig;
