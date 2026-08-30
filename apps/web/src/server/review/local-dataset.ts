import "server-only";

import { readFile, realpath, stat } from "node:fs/promises";
import { isAbsolute, relative, resolve } from "node:path";

import { z } from "zod";

import { KnowledgeDatasetSchema } from "@/domain/knowledge/schema";
import type { ReviewDataset, ReviewStatus } from "@/domain/review/types";

const ReviewAtlasSchema = z.object({
  title: z.string().min(1),
  spots: z.array(z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    region: z.string().min(1),
    kind: z.string().min(1),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    claimIds: z.array(z.string()),
  })).min(1),
  connections: z.array(z.object({
    id: z.string().min(1),
    eyebrow: z.string().min(1),
    title: z.string().min(1),
    summary: z.string().min(1),
    spotIds: z.array(z.string()).min(2),
    claimIds: z.array(z.string()).min(1),
    concepts: z.array(z.string()).min(1),
  })),
});

export class LocalReviewDatasetError extends Error {
  constructor(
    public readonly code:
      | "disabled"
      | "not_configured"
      | "invalid_root"
      | "invalid_path"
      | "not_found"
      | "invalid_dataset"
      | "invalid_atlas",
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
  atlasRelativePath?: string | null;
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
    atlasRelativePath: process.env.RESOWORLD_REVIEW_ATLAS_FILE?.trim() || null,
    initialStatus,
  };
}

async function resolveLocalJson(root: string, relativePath: string) {
  if (isAbsolute(relativePath)) {
    throw new LocalReviewDatasetError(
      "invalid_path",
      "Review paths must be relative.",
    );
  }
  const candidate = await realpath(resolve(root, relativePath));
  const relativeToRoot = relative(root, candidate);
  if (
    relativeToRoot.startsWith("..") ||
    isAbsolute(relativeToRoot) ||
    !candidate.toLocaleLowerCase("en-US").endsWith(".json")
  ) {
    throw new LocalReviewDatasetError(
      "invalid_path",
      "Review files must be JSON files inside the configured root.",
    );
  }
  const candidateStat = await stat(candidate);
  if (!candidateStat.isFile()) {
    throw new LocalReviewDatasetError(
      "invalid_path",
      "Review file is not a regular file.",
    );
  }
  return candidate;
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

    const candidate = await resolveLocalJson(root, config.relativePath);
    const dataset = KnowledgeDatasetSchema.parse(
      JSON.parse(await readFile(candidate, "utf8")),
    );

    let atlas = null;
    if (config.atlasRelativePath) {
      try {
        const atlasPath = await resolveLocalJson(root, config.atlasRelativePath);
        atlas = ReviewAtlasSchema.parse(
          JSON.parse(await readFile(atlasPath, "utf8")),
        );
        const claimIds = new Set(dataset.claims.map((claim) => claim.id));
        const spotIds = new Set(atlas.spots.map((spot) => spot.id));
        const referencesUnknownClaim = [
          ...atlas.spots.flatMap((spot) => spot.claimIds),
          ...atlas.connections.flatMap((connection) => connection.claimIds),
        ].some((claimId) => !claimIds.has(claimId));
        const referencesUnknownSpot = atlas.connections
          .flatMap((connection) => connection.spotIds)
          .some((spotId) => !spotIds.has(spotId));
        if (referencesUnknownClaim || referencesUnknownSpot) {
          throw new Error("Atlas references unknown local records.");
        }
      } catch (error) {
        if (error instanceof LocalReviewDatasetError) throw error;
        throw new LocalReviewDatasetError(
          "invalid_atlas",
          "Local atlas configuration is invalid.",
        );
      }
    }

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
      atlas,
    };
  } catch (error) {
    if (error instanceof LocalReviewDatasetError) throw error;
    if (
      error instanceof SyntaxError ||
      (error instanceof Error && error.name === "ZodError")
    ) {
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
