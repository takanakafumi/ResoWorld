import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  ingestTravelogue,
  TravelogueIngestManifestSchema,
} from "../src/domain/imports/ingest-travelogue";
import type { ReviewAtlas, ReviewDataset } from "../src/domain/review/types";
import { syncReviewDatasets } from "./sync-dataset";

function parseArgs(argv: readonly string[]) {
  const args = argv.filter((arg) => arg !== "--");
  const getValue = (flag: string) => {
    const idx = args.indexOf(flag);
    return idx >= 0 ? args[idx + 1] : undefined;
  };
  const textPath = getValue("--text");
  const manifestPath = getValue("--manifest");
  const dryRun = args.includes("--dry-run");
  if (!textPath || !manifestPath) {
    throw new Error(
      "Usage: pnpm --dir apps/web run ingest:travelogue -- --text <travelogue.txt> --manifest <manifest.json> [--dry-run]",
    );
  }
  return { textPath, manifestPath, dryRun };
}

function main() {
  const { textPath, manifestPath, dryRun } = parseArgs(process.argv.slice(2));
  const repoRoot = resolve(__dirname, "../../..");
  const publishedPath = resolve(repoRoot, "apps/web/src/data/published-review-dataset.json");

  const rawText = readFileSync(resolve(textPath), "utf8");
  const manifest = TravelogueIngestManifestSchema.parse(
    JSON.parse(readFileSync(resolve(manifestPath), "utf8")),
  );
  const currentDataset = JSON.parse(readFileSync(publishedPath, "utf8")) as ReviewDataset & {
    documents: Array<Record<string, unknown>>;
    atlas: ReviewAtlas;
  };

  const result = ingestTravelogue({
    dataset: currentDataset,
    rawText,
    manifest,
    runGovernanceAudit: true,
  });

  if (result.governance.totalViolations > 0) {
    console.error("[ingest:travelogue] Governance audit failed:", JSON.stringify(result.governance, null, 2));
    process.exit(1);
  }

  if (result.promotionReport.unretiredMatchingSuggestions.length > 0) {
    console.warn(
      "[ingest:travelogue] Warning: existing suggestions match newly visited spots and should be added to retireSuggestionIds:",
      result.promotionReport.unretiredMatchingSuggestions,
    );
  }

  if (result.promotionReport.nodesMissingPrimarySpotId.length > 0) {
    console.warn(
      "[ingest:travelogue] Action recommended: add explicit primarySpotId to these matching LENS pack entities:",
      result.promotionReport.nodesMissingPrimarySpotId,
    );
  }

  if (dryRun) {
    console.log(
      "[ingest:travelogue] DRY RUN PASSED (no files written):",
      JSON.stringify(
        {
          summary: result.summary,
          promotionReport: result.promotionReport,
          governanceViolations: result.governance.totalViolations,
        },
        null,
        2,
      ),
    );
    return;
  }

  writeFileSync(publishedPath, JSON.stringify(result.dataset, null, 2) + "\n", "utf8");
  const syncResult = syncReviewDatasets("from-published", { repoRootDir: repoRoot });

  console.log(
    "[ingest:travelogue] INGEST & 3-WAY SYNC COMPLETE:",
    JSON.stringify(
      {
        summary: result.summary,
        promotionReport: result.promotionReport,
        syncResult,
      },
      null,
      2,
    ),
  );
}

main();
