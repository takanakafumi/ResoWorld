import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const rootDir = resolve(__dirname, "..");
const repoRootDir = resolve(rootDir, "../..");
const localDatasetPath = resolve(repoRootDir, "data/imports/tomono-review-draft.json");
const localAtlasPath = resolve(repoRootDir, "data/imports/review/travel-atlas.yamatai.json");
const publishedDatasetPath = resolve(rootDir, "src/data/published-review-dataset.json");

if (existsSync(localDatasetPath) && existsSync(localAtlasPath) && existsSync(publishedDatasetPath)) {
  try {
    const localDataset = JSON.parse(readFileSync(localDatasetPath, "utf8"));
    const localAtlas = JSON.parse(readFileSync(localAtlasPath, "utf8"));
    const published = JSON.parse(readFileSync(publishedDatasetPath, "utf8"));
    published.documents = localDataset.documents;
    published.claims = localDataset.claims;
    published.atlas = localAtlas;
    writeFileSync(publishedDatasetPath, JSON.stringify(published, null, 2) + "\n", "utf8");
    console.log(
      `[build-static-pages] Synced local dataset (${localAtlas.spots?.length ?? 0} spots, ${localDataset.claims?.length ?? 0} claims) to published-review-dataset.json.`,
    );
  } catch (err) {
    console.warn("[build-static-pages] Warning: Could not sync local dataset:", err);
  }
}

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
