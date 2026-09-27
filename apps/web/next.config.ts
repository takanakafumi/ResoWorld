import type { NextConfig } from "next";
import { resolve } from "node:path";

const nextConfig: NextConfig = {
  distDir: process.env.RESOWORLD_NEXT_DIST_DIR || ".next",
  turbopack: {
    root: resolve(__dirname, "../.."),
  },
};

export default nextConfig;
