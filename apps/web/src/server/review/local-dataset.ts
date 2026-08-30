import "server-only";

import { readFile, realpath, stat } from "node:fs/promises";
import { isAbsolute, relative, resolve } from "node:path";

import { KnowledgeDatasetSchema } from "@/domain/knowledge/schema";
import type { ReviewDataset, ReviewStatus } from "@/domain/review/types";

export class LocalReviewDatasetError extends Error {
  constructor(
    public readonly code:
      | "disabled"
      | "not_configured"
      | "invalid_root"
      | "invalid_path"
      | "not_found"
      | "invalid_dataset",
    message: string,
  ) {
    super(message);
    this.name = "LocalReviewDatasetError";
  }
}

export type LocalReviewDatasetConfig = {
  enabled: boolean;
  rootPath: string | null;
  relativePath: string | null;
  initialStatus: ReviewStatus | null;
};

export function localReviewDatasetConfigFromEnvironment(): LocalReviewDatasetConfig {
  const configuredStatus = process.env.RESOWORLD_REVIEW_INITIAL_STATUS?.trim();
  const initialStatus = [
    "suggested",
    "needs_review",
    "confirmed",
    "rejected",
  ].includes(configuredStatus ?? "")
    ? (configuredStatus as ReviewStatus)
    : null;
  return {
    enabled: process.env.RESOWORLD_REVIEW_ENABLED === "true",
    rootPath: process.env.RESOWORLD_REVIEW_DIR?.trim() || null,
    relativePath: process.env.RESOWORLD_REVIEW_FILE?.trim() || null,
    initialStatus,
  };
}

export async function loadLocalReviewDataset(
  config = localReviewDatasetConfigFromEnvironment(),
): Promise<ReviewDataset> {
  if (!config.enabled) {
    throw new LocalReviewDatasetError(
      "disabled",
      "Local review workspace is disabled.",
    );
  }
  if (!config.rootPath || !config.relativePath) {
    throw new LocalReviewDatasetError(
      "not_configured",
      "Local review dataset is not configured.",
    );
  }
  if (isAbsolute(config.relativePath) || !isAbsolute(config.rootPath)) {
    throw new LocalReviewDatasetError(
      "invalid_path",
      "Review dataset paths are invalid.",
    );
  }

  try {
    const root = await realpath(config.rootPath);
    const rootStat = await stat(root);
    if (!rootStat.isDirectory()) {
      throw new LocalReviewDatasetError(
        "invalid_root",
        "Review dataset root is not a directory.",
      );
    }
    const candidate = await realpath(resolve(root, config.relativePath));
    const relativeToRoot = relative(root, candidate);
    if (
      relativeToRoot.startsWith("..") ||
      isAbsolute(relativeToRoot) ||
      !candidate.toLocaleLowerCase("en-US").endsWith(".json")
    ) {
      throw new LocalReviewDatasetError(
        "invalid_path",
        "Review dataset must be a JSON file inside the configured root.",
      );
    }
    const candidateStat = await stat(candidate);
    if (!candidateStat.isFile()) {
      throw new LocalReviewDatasetError(
        "invalid_path",
        "Review dataset is not a regular file.",
      );
    }
    const dataset = KnowledgeDatasetSchema.parse(
      JSON.parse(await readFile(candidate, "utf8")),
    );
    return {
      datasetId: dataset.datasetId,
      privacy: dataset.privacy,
      documents: dataset.documents.map(({ id, title }) => ({ id, title })),
      claims: config.initialStatus
        ? dataset.claims.map((claim) => ({
            ...claim,
            reviewStatus: config.initialStatus ?? claim.reviewStatus,
          }))
        : dataset.claims,
    };
  } catch (error) {
    if (error instanceof LocalReviewDatasetError) throw error;
    if (error instanceof SyntaxError || error instanceof Error && error.name === "ZodError") {
      throw new LocalReviewDatasetError(
        "invalid_dataset",
        "Review dataset did not satisfy the Knowledge Dataset schema.",
      );
    }
    throw new LocalReviewDatasetError(
      "not_found",
      "Review dataset could not be read.",
    );
  }
}
