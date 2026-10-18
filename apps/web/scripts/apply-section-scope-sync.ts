import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { basename, resolve } from "node:path";
import { applySectionScopeInheritance } from "../src/domain/imports/section-scope-inheritance.ts";
import type { ReviewDataset } from "../src/domain/review/types.ts";

const repoRoot = resolve(__dirname, "../../..");
const webRoot = resolve(__dirname, "..");
const publishedPath = resolve(webRoot, "src/data/published-review-dataset.json");

if (!existsSync(publishedPath)) {
  console.error("Published dataset not found at:", publishedPath);
  process.exit(1);
}

const dataset: ReviewDataset = JSON.parse(readFileSync(publishedPath, "utf8"));

function documentTextGetter(docId: string, docPath?: string): string | undefined {
  if (docPath) {
    const candidates = [
      resolve(repoRoot, docPath),
      resolve(repoRoot, "旅行記", basename(docPath)),
      resolve(webRoot, docPath),
    ];
    for (const cand of candidates) {
      if (existsSync(cand)) {
        return readFileSync(cand, "utf8");
      }
    }
  }
  return undefined;
}

const result = applySectionScopeInheritance(dataset, documentTextGetter);
console.log(`[section-scope-sync] Inherited and linked ${result.linkedCount} claims:`);
for (const link of result.links) {
  console.log(`  + [${link.spotName}] ${link.statement}`);
}

if (result.linkedCount > 0) {
  writeFileSync(publishedPath, JSON.stringify(result.dataset, null, 2) + "\n", "utf8");
  console.log(`[section-scope-sync] Updated ${publishedPath}`);

  const draftPath = resolve(repoRoot, "data/imports/tomono-review-draft.json");
  if (existsSync(draftPath)) {
    const draft = JSON.parse(readFileSync(draftPath, "utf8"));
    draft.claims = result.dataset.claims;
    writeFileSync(draftPath, JSON.stringify(draft, null, 2) + "\n", "utf8");
    console.log(`[section-scope-sync] Updated ${draftPath}`);
  }

  const atlasPath = resolve(repoRoot, "data/imports/review/travel-atlas.yamatai.json");
  if (existsSync(atlasPath) && result.dataset.atlas) {
    const atlas = JSON.parse(readFileSync(atlasPath, "utf8"));
    atlas.spots = result.dataset.atlas.spots;
    writeFileSync(atlasPath, JSON.stringify(atlas, null, 2) + "\n", "utf8");
    console.log(`[section-scope-sync] Updated ${atlasPath}`);
  }
} else {
  console.log("[section-scope-sync] All sections are already 100% in sync!");
}
