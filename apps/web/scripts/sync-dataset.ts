import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";

export type DatasetSyncMode = "auto" | "to-published" | "from-published";

export interface SyncDatasetResult {
  direction: "in-sync" | "to-published" | "from-published" | "skipped";
  spotsCount: number;
  claimsCount: number;
  message: string;
}

const DEFAULT_LOCAL_DATASET_SCHEMA_VERSION = "0.2.0";
const DEFAULT_LOCAL_DATASET_ID = "gold-munakata-usa-kunisaki-v1-schema-0.2.0";

function hasGitWorkingTreeChanges(repoRootDir: string, relativePaths: readonly string[]): boolean {
  try {
    const result = spawnSync(
      "git",
      ["status", "--porcelain", "--", ...relativePaths],
      { cwd: repoRootDir, encoding: "utf8" },
    );
    if (result.status !== 0) return false;
    return result.stdout.trim().length > 0;
  } catch {
    return false;
  }
}

function stableEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * Synchronizes the local/master dataset files (`data/imports/tomono-review-draft.json` and
 * `data/imports/review/travel-atlas.yamatai.json`) with the web-bundled dataset
 * (`apps/web/src/data/published-review-dataset.json`).
 *
 * Prevents accidental rollback when pulling changes from a Cloud Remote Agent
 * (`published-review-dataset.json` updated) onto a local workstation (or vice versa).
 */
export function syncReviewDatasets(
  mode: DatasetSyncMode = "auto",
  options: { repoRootDir?: string; log?: boolean } = {},
): SyncDatasetResult {
  const repoRootDir = options.repoRootDir ?? resolve(__dirname, "../../..");
  const webRootDir = resolve(repoRootDir, "apps/web");
  const localDatasetPath = resolve(repoRootDir, "data/imports/tomono-review-draft.json");
  const localAtlasPath = resolve(repoRootDir, "data/imports/review/travel-atlas.yamatai.json");
  const publishedDatasetPath = resolve(webRootDir, "src/data/published-review-dataset.json");
  const shouldLog = options.log !== false;

  if (!existsSync(publishedDatasetPath)) {
    const message = "[sync-dataset] Published dataset not found; skipping sync.";
    if (shouldLog) console.warn(message);
    return { direction: "skipped", spotsCount: 0, claimsCount: 0, message };
  }

  const published = JSON.parse(readFileSync(publishedDatasetPath, "utf8")) as {
    datasetId?: string;
    privacy?: string;
    documents?: unknown[];
    claims?: unknown[];
    atlas?: { spots?: unknown[] };
  };

  const localDatasetExists = existsSync(localDatasetPath);
  const localAtlasExists = existsSync(localAtlasPath);

  let localDataset: {
    schemaVersion?: string;
    datasetId?: string;
    privacy?: string;
    documents?: unknown[];
    sources?: unknown[];
    claims?: unknown[];
  } = {
    schemaVersion: DEFAULT_LOCAL_DATASET_SCHEMA_VERSION,
    datasetId: DEFAULT_LOCAL_DATASET_ID,
    privacy: "local-only",
    documents: [],
    sources: [],
    claims: [],
  };
  let localAtlas: { spots?: unknown[] } | null = null;

  if (localDatasetExists) {
    localDataset = JSON.parse(readFileSync(localDatasetPath, "utf8"));
  }
  if (localAtlasExists) {
    localAtlas = JSON.parse(readFileSync(localAtlasPath, "utf8"));
  }

  const alreadyInSync =
    localDatasetExists &&
    localAtlasExists &&
    stableEqual(published.documents ?? [], localDataset.documents ?? []) &&
    stableEqual(published.claims ?? [], localDataset.claims ?? []) &&
    stableEqual(published.atlas ?? {}, localAtlas ?? {});

  const pubSpots = published.atlas?.spots?.length ?? 0;
  const pubClaims = published.claims?.length ?? 0;

  if (alreadyInSync) {
    const message = `[sync-dataset] Datasets are already in sync (${pubSpots} spots, ${pubClaims} claims).`;
    if (shouldLog) console.log(message);
    return { direction: "in-sync", spotsCount: pubSpots, claimsCount: pubClaims, message };
  }

  let resolvedDirection: "to-published" | "from-published";
  if (mode === "from-published") {
    resolvedDirection = "from-published";
  } else if (mode === "to-published") {
    if (!localDatasetExists || !localAtlasExists) {
      throw new Error(
        "Cannot run --to-published because local master files in data/imports/ are missing.",
      );
    }
    resolvedDirection = "to-published";
  } else {
    // Auto direction: preserve whichever side was modified without clobbering remote updates
    if (!localDatasetExists || !localAtlasExists) {
      resolvedDirection = "from-published";
    } else {
      const localDirty = hasGitWorkingTreeChanges(repoRootDir, [
        "data/imports/tomono-review-draft.json",
        "data/imports/review/travel-atlas.yamatai.json",
      ]);
      const publishedDirty = hasGitWorkingTreeChanges(repoRootDir, [
        "apps/web/src/data/published-review-dataset.json",
      ]);

      if (publishedDirty && !localDirty) {
        resolvedDirection = "from-published";
      } else if (localDirty && !publishedDirty) {
        resolvedDirection = "to-published";
      } else {
        const localMaxMtime = Math.max(
          statSync(localDatasetPath).mtimeMs,
          statSync(localAtlasPath).mtimeMs,
        );
        const publishedMtime = statSync(publishedDatasetPath).mtimeMs;
        resolvedDirection = publishedMtime > localMaxMtime ? "from-published" : "to-published";
      }
    }
  }

  if (resolvedDirection === "from-published") {
    mkdirSync(dirname(localDatasetPath), { recursive: true });
    mkdirSync(dirname(localAtlasPath), { recursive: true });

    const nextLocalDataset = {
      schemaVersion: localDataset.schemaVersion ?? DEFAULT_LOCAL_DATASET_SCHEMA_VERSION,
      datasetId: localDataset.datasetId ?? DEFAULT_LOCAL_DATASET_ID,
      privacy: localDataset.privacy ?? "local-only",
      documents: published.documents ?? [],
      sources: localDataset.sources ?? [],
      claims: published.claims ?? [],
    };
    writeFileSync(localDatasetPath, JSON.stringify(nextLocalDataset, null, 2) + "\n", "utf8");
    writeFileSync(
      localAtlasPath,
      JSON.stringify(published.atlas ?? {}, null, 2) + "\n",
      "utf8",
    );

    const message = `[sync-dataset] Synced published-review-dataset.json -> data/imports/ (${pubSpots} spots, ${pubClaims} claims).`;
    if (shouldLog) console.log(message);
    return {
      direction: "from-published",
      spotsCount: pubSpots,
      claimsCount: pubClaims,
      message,
    };
  }

  const nextPublished = {
    datasetId: published.datasetId ?? "resoworld-published-atlas",
    privacy: published.privacy ?? "anonymized-demo",
    documents: localDataset.documents ?? [],
    claims: localDataset.claims ?? [],
    atlas: localAtlas ?? {},
  };
  writeFileSync(publishedDatasetPath, JSON.stringify(nextPublished, null, 2) + "\n", "utf8");

  const localSpots = localAtlas?.spots?.length ?? 0;
  const localClaims = localDataset.claims?.length ?? 0;
  const message = `[sync-dataset] Synced data/imports/ -> published-review-dataset.json (${localSpots} spots, ${localClaims} claims).`;
  if (shouldLog) console.log(message);
  return {
    direction: "to-published",
    spotsCount: localSpots,
    claimsCount: localClaims,
    message,
  };
}

function parseCliMode(argv: readonly string[]): DatasetSyncMode {
  if (argv.includes("--from-published")) return "from-published";
  if (argv.includes("--to-published")) return "to-published";
  return "auto";
}

const isMainModule =
  typeof process.argv[1] === "string" &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (isMainModule) {
  const mode = parseCliMode(process.argv.slice(2));
  syncReviewDatasets(mode);
}
