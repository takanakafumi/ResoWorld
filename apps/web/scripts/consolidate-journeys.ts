import { copyFile, readFile, realpath, rename, writeFile } from "node:fs/promises";
import { basename, dirname, isAbsolute, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { consolidateJourneysByDocumentIdentity } from "../src/domain/imports/journey-atlas-update";
import type { ReviewAtlas } from "../src/domain/review/types";

async function main() {
  const input = process.argv.find((argument, index) => index >= 2 && argument !== "--");
  if (!input || !isAbsolute(input)) throw new Error("Pass an absolute Atlas JSON path.");

  const scriptDirectory = dirname(fileURLToPath(import.meta.url));
  const workspace = await realpath(join(scriptDirectory, "..", "..", ".."));
  const atlasPath = await realpath(input);
  const relativePath = relative(workspace, atlasPath);
  if (relativePath.startsWith("..") || isAbsolute(relativePath) || !atlasPath.toLowerCase().endsWith(".json")) {
    throw new Error("Atlas must be a JSON file inside the workspace.");
  }

  const atlas = JSON.parse(await readFile(atlasPath, "utf8")) as ReviewAtlas;
  const updated = consolidateJourneysByDocumentIdentity(atlas);
  const before = atlas.journeys?.length ?? 0;
  const after = updated.journeys?.length ?? 0;
  if (before === after) {
    console.log(JSON.stringify({ changed: false, journeys: before }));
    return;
  }

  const backup = join(dirname(atlasPath), `${basename(atlasPath, ".json")}.before-journey-consolidation-${Date.now()}.json`);
  const temporary = `${atlasPath}.tmp`;
  await copyFile(atlasPath, backup);
  await writeFile(temporary, `${JSON.stringify(updated, null, 2)}\n`, "utf8");
  await rename(temporary, atlasPath);
  console.log(JSON.stringify({ changed: true, before, after, backup: basename(backup) }));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
