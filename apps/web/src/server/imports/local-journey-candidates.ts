import "server-only";

import { copyFile, readFile, readdir, realpath, rename, writeFile } from "node:fs/promises";
import { basename, isAbsolute, join, relative } from "node:path";

import { JourneyImportCandidateSchema } from "@/domain/imports/journey-candidate";
import { JourneyPlaceReviewDraftSchema, type JourneyPlaceReviewDraft } from "@/domain/imports/journey-place-review";
import type { JourneyAtlasUpdateDraft } from "@/domain/imports/journey-atlas-update";
import type { JourneyEntityResolutionDraft } from "@/domain/imports/journey-entity-resolution";
import type { ReviewAtlas } from "@/domain/review/types";
import { ReviewAtlasSchema } from "@/server/review/local-dataset";
import { localReviewDatasetConfigFromEnvironment, LocalReviewDatasetError } from "@/server/review/local-dataset";

async function reviewRoot() {
  const config = localReviewDatasetConfigFromEnvironment();
  if (!config.enabled || !config.rootPath || !isAbsolute(config.rootPath)) {
    throw new LocalReviewDatasetError("not_configured", "Local review directory is not configured.");
  }
  return realpath(config.rootPath);
}

export async function listLocalJourneyCandidates() {
  const root = await reviewRoot();
  const entries = await readdir(root, { withFileTypes: true });
  const candidates = [];
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".journey-candidate.json")) continue;
    const parsed = JourneyImportCandidateSchema.safeParse(JSON.parse(await readFile(join(root, entry.name), "utf8")));
    if (parsed.success) candidates.push({ file: entry.name, candidate: parsed.data });
  }
  return candidates;
}

export async function loadLocalJourneyCandidate(file: string) {
  if (!file || isAbsolute(file) || basename(file) !== file || !file.endsWith(".journey-candidate.json")) {
    throw new LocalReviewDatasetError("invalid_path", "Journey candidate path is invalid.");
  }
  const root = await reviewRoot();
  const candidatePath = await realpath(join(root, file));
  const relativePath = relative(root, candidatePath);
  if (relativePath.startsWith("..") || isAbsolute(relativePath)) {
    throw new LocalReviewDatasetError("invalid_path", "Journey candidate is outside the review directory.");
  }
  const parsed = JourneyImportCandidateSchema.safeParse(JSON.parse(await readFile(candidatePath, "utf8")));
  if (!parsed.success) throw new LocalReviewDatasetError("invalid_dataset", "Journey candidate is invalid.");
  return parsed.data;
}

function reviewFileName(candidateFile: string) {
  if (!candidateFile.endsWith(".journey-candidate.json")) {
    throw new LocalReviewDatasetError("invalid_path", "Journey candidate filename is invalid.");
  }
  return candidateFile.replace(/\.journey-candidate\.json$/, ".place-review.json");
}

export async function loadLocalJourneyPlaceReview(candidateFile: string) {
  const root = await reviewRoot();
  try {
    const source = await readFile(join(root, reviewFileName(candidateFile)), "utf8");
    return JourneyPlaceReviewDraftSchema.parse(JSON.parse(source));
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") return null;
    throw error;
  }
}

export async function saveLocalJourneyPlaceReview(candidateFile: string, draft: JourneyPlaceReviewDraft) {
  const root = await reviewRoot();
  const destination = join(root, reviewFileName(candidateFile));
  const temporary = destination + ".tmp";
  await writeFile(temporary, JSON.stringify(draft, null, 2) + "\n", "utf8");
  await rename(temporary, destination);
  return reviewFileName(candidateFile);
}

export async function saveLocalJourneyAtlasUpdate(candidateFile: string, draft: JourneyAtlasUpdateDraft) {
  const root = await reviewRoot();
  const filename = candidateFile.replace(/\.journey-candidate\.json$/, ".atlas-update.json");
  const destination = join(root, filename);
  const temporary = destination + ".tmp";
  await writeFile(temporary, JSON.stringify(draft, null, 2) + "\n", "utf8");
  await rename(temporary, destination);
  return filename;
}

export async function saveLocalJourneyEntityResolution(candidateFile: string, draft: JourneyEntityResolutionDraft) {
  const root = await reviewRoot();
  const filename = candidateFile.replace(/\.journey-candidate\.json$/, ".entity-resolution.json");
  const destination = join(root, filename);
  const temporary = destination + ".tmp";
  await writeFile(temporary, JSON.stringify(draft, null, 2) + "\n", "utf8");
  await rename(temporary, destination);
  return filename;
}

export async function saveLocalJourneyAtlasPreview(candidateFile: string, atlas: ReviewAtlas) {
  const root = await reviewRoot();
  const filename = candidateFile.replace(/\.journey-candidate\.json$/, ".atlas-preview.json");
  const destination = join(root, filename);
  const temporary = destination + ".tmp";
  await writeFile(temporary, JSON.stringify(atlas, null, 2) + "\n", "utf8");
  await rename(temporary, destination);
  return filename;
}

export async function applyLocalJourneyAtlas(candidateFile: string, atlas: ReviewAtlas) {
  const root = await reviewRoot();
  const configuredFile = process.env.RESOWORLD_REVIEW_ATLAS_FILE?.trim();
  if (!configuredFile || isAbsolute(configuredFile)) {
    throw new LocalReviewDatasetError("not_configured", "Local Atlas file is not configured.");
  }
  const destination = await realpath(join(root, configuredFile));
  const relativePath = relative(root, destination);
  if (relativePath.startsWith("..") || isAbsolute(relativePath)) {
    throw new LocalReviewDatasetError("invalid_path", "Local Atlas is outside the review directory.");
  }
  const validated = ReviewAtlasSchema.parse(atlas);
  const safeCandidateName = candidateFile.replace(/\.journey-candidate\.json$/, "").replace(/[^a-zA-Z0-9._-]+/g, "-");
  const backup = join(root, `${basename(configuredFile, ".json")}.before-${safeCandidateName}-${Date.now()}.json`);
  const temporary = destination + ".tmp";
  await copyFile(destination, backup);
  await writeFile(temporary, JSON.stringify(validated, null, 2) + "\n", "utf8");
  await rename(temporary, destination);
  return { atlasFile: configuredFile, backupFile: basename(backup) };
}
