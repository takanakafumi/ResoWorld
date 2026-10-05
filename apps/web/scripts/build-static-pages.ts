import { existsSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const rootDir = resolve(__dirname, "..");

console.log("[build-static-pages] Starting Next.js static export build...");
const env = {
  ...process.env,
  STATIC_EXPORT: "true",
  GITHUB_PAGES: "true",
  NEXT_PUBLIC_BASE_PATH: process.env.NEXT_PUBLIC_BASE_PATH || "/ResoWorld",
};

const isWindows = process.platform === "win32";
const cmd = isWindows ? "npx.cmd" : "npx";

const result = spawnSync(cmd, ["next", "build"], {
  cwd: rootDir,
  stdio: "inherit",
  env,
  shell: isWindows,
});

if (result.status !== 0) {
  console.error(`[build-static-pages] Build failed with exit code ${result.status}`);
  process.exit(result.status || 1);
}

const outDir = resolve(rootDir, "out");
if (existsSync(outDir)) {
  writeFileSync(resolve(outDir, ".nojekyll"), "");
  console.log("[build-static-pages] Successfully created .nojekyll in out directory.");
}
console.log("[build-static-pages] Static pages export complete!");
