import "server-only";

import { readFile, realpath, stat } from "node:fs/promises";
import { isAbsolute, relative, resolve } from "node:path";

import { z } from "zod";

import { KnowledgeDatasetSchema } from "@/domain/knowledge/schema";
import type { ReviewDataset, ReviewStatus } from "@/domain/review/types";

const ReviewAtlasSchema = z.object({
  title: z.string().min(1),
  journeys: z.array(z.object({
    id: z.string().min(1),
    label: z.string().min(1),
    documentIds: z.array(z.string().min(1)).min(1),
    spotIds: z.array(z.string().min(1)).min(1),
    connectionIds: z.array(z.string().min(1)),
  })).default([]),
  spots: z.array(z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    region: z.string().min(1),
    kind: z.string().min(1),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    claimIds: z.array(z.string()),
    positionStatus: z.enum(["candidate", "confirmed", "rejected"]).default("confirmed"),
  })).min(1),
  connections: z.array(z.object({
    id: z.string().min(1),
    eyebrow: z.string().min(1),
    title: z.string().min(1),
    summary: z.string().min(1),
    spotIds: z.array(z.string()).min(2),
    claimIds: z.array(z.string()).min(1),
    concepts: z.array(z.string()).min(1),
    facets: z.array(z.object({
      id: z.string().min(1),
      label: z.string().min(1),
      weight: z.number().int().min(1).max(5),
    })).min(1),
    eras: z.array(z.object({
      id: z.string().min(1),
      label: z.string().min(1),
      range: z.string().min(1),
      mapLabel: z.string().min(1),
      mapLayer: z.enum(["mythic", "maritime", "religious", "domain", "modern", "present"]),
      spotIds: z.array(z.string()).min(1),
      claimIds: z.array(z.string()).min(1),
    })).min(1),
  })),
  suggestions: z.array(z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    targetName: z.string().min(1),
    actionType: z.enum(["field_visit", "literature_research", "revisit"]),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    question: z.string().min(1),
    missingInformation: z.string().min(1),
    reason: z.string().min(1),
    expectedObservation: z.string().min(1),
    uncertainty: z.string().min(1),
    claimIds: z.array(z.string()).min(1),
    anchorSpotIds: z.array(z.string()).min(1),
    connectionIds: z.array(z.string()).min(1),
    initialStatus: z.enum(["suggested", "accepted", "rejected"]),
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
        const connectionIds = new Set(
          atlas.connections.map((connection) => connection.id),
        );
        const referencesUnknownClaim = [
          ...atlas.spots.flatMap((spot) => spot.claimIds),
          ...atlas.connections.flatMap((connection) => [
            ...connection.claimIds,
            ...connection.eras.flatMap((era) => era.claimIds),
          ]),
          ...atlas.suggestions.flatMap((suggestion) => suggestion.claimIds),
        ].some((claimId) => !claimIds.has(claimId));
        const referencesUnknownSpot = [
          ...atlas.connections.flatMap((connection) => [
            ...connection.spotIds,
            ...connection.eras.flatMap((era) => era.spotIds),
          ]),
          ...atlas.suggestions.flatMap((suggestion) => suggestion.anchorSpotIds),
        ].some((spotId) => !spotIds.has(spotId));
        const referencesUnknownConnection = atlas.suggestions
          .flatMap((suggestion) => suggestion.connectionIds)
          .some((connectionId) => !connectionIds.has(connectionId));
        const documentIds = new Set(dataset.documents.map((document) => document.id));
        const referencesUnknownJourneyRecord = (atlas.journeys ?? []).some((journey) =>
          journey.documentIds.some((documentId) => !documentIds.has(documentId)) ||
          journey.spotIds.some((spotId) => !spotIds.has(spotId)) ||
          journey.connectionIds.some((connectionId) => !connectionIds.has(connectionId)),
        );
        if (
          referencesUnknownClaim ||
          referencesUnknownSpot ||
          referencesUnknownConnection ||
          referencesUnknownJourneyRecord
        ) {
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
      transportPolicy: dataset.transportPolicy,
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
