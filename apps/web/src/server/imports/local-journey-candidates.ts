import "server-only";

import { readFile, readdir, realpath } from "node:fs/promises";
import { basename, isAbsolute, join, relative } from "node:path";

import { JourneyImportCandidateSchema } from "@/domain/imports/journey-candidate";
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
