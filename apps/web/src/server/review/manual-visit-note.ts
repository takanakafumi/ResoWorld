import "server-only";

import { copyFile, mkdir, readFile, realpath, rename, rm, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { basename, dirname, isAbsolute, join, relative, resolve } from "node:path";

import { materializeManualVisitNote, materializeNewManualVisitCandidate } from "@/domain/imports/manual-visit-note";
import { ReviewAtlasSchema, localReviewDatasetConfigFromEnvironment, type LocalReviewDatasetConfig } from "./local-dataset";
import { loadLocalKnowledgeDataset } from "./knowledge-dataset";

function inside(root: string, target: string) {
  const value = relative(root, target);
  return !value.startsWith("..") && !isAbsolute(value);
}

export async function applyLocalManualVisitNote({
  journeyId,
  spotId,
  note,
  observedAt,
  config = localReviewDatasetConfigFromEnvironment(),
}: {
  journeyId: string;
  spotId: string;
  note: string;
  observedAt?: string;
  config?: LocalReviewDatasetConfig;
}) {
  if (!config.enabled || !config.rootPath || !config.relativePath || !config.atlasRelativePath || !isAbsolute(config.rootPath) || isAbsolute(config.relativePath) || isAbsolute(config.atlasRelativePath)) {
    throw new Error("Local review Dataset and Atlas must be configured.");
  }
  const root = await realpath(config.rootPath);
  const datasetPath = await realpath(resolve(root, config.relativePath));
  const atlasPath = await realpath(resolve(root, config.atlasRelativePath));
  if (!inside(root, datasetPath) || !inside(root, atlasPath)) throw new Error("Review files must stay inside the configured root.");
  const dataset = await loadLocalKnowledgeDataset(config);
  const atlas = ReviewAtlasSchema.parse(JSON.parse(await readFile(atlasPath, "utf8")));
  const normalized = note.trim();
  const digest = createHash("sha256").update(`${journeyId}\n${spotId}\n${normalized}`, "utf8").digest("hex");
  const suffix = digest.slice(0, 20);
  const documentId = `document-manual-${suffix}`;
  const claimId = `claim-manual-${suffix}`;
  const relativePath = `.resoworld/manual-notes/${documentId}.txt`;
  const result = materializeManualVisitNote({
    dataset,
    atlas,
    input: {
      journeyId,
      spotId,
      note: normalized,
      documentId,
      claimId,
      documentSha256: createHash("sha256").update(normalized, "utf8").digest("hex"),
      relativePath,
      createdAt: new Date().toISOString(),
      observedAt,
    },
  });
  if (result.status === "unchanged") return { status: result.status, documentId, claimId };

  const notePath = resolve(root, relativePath);
  if (!inside(root, notePath)) throw new Error("Manual note path must stay inside the configured root.");
  await mkdir(dirname(notePath), { recursive: true });
  const stamp = Date.now();
  const datasetBackup = join(root, `${basename(config.relativePath, ".json")}.before-manual-note-${stamp}.json`);
  const atlasBackup = join(root, `${basename(config.atlasRelativePath, ".json")}.before-manual-note-${stamp}.json`);
  const datasetTemp = `${datasetPath}.manual-note-${stamp}.tmp`;
  const atlasTemp = `${atlasPath}.manual-note-${stamp}.tmp`;
  const noteTemp = `${notePath}.${stamp}.tmp`;
  await Promise.all([
    copyFile(datasetPath, datasetBackup),
    copyFile(atlasPath, atlasBackup),
    writeFile(datasetTemp, JSON.stringify(result.dataset, null, 2) + "\n", "utf8"),
    writeFile(atlasTemp, JSON.stringify(ReviewAtlasSchema.parse(result.atlas), null, 2) + "\n", "utf8"),
    writeFile(noteTemp, normalized + "\n", "utf8"),
  ]);
  try {
    await rename(noteTemp, notePath);
    await rename(datasetTemp, datasetPath);
    await rename(atlasTemp, atlasPath);
  } catch (error) {
    await Promise.allSettled([
      copyFile(datasetBackup, datasetPath),
      copyFile(atlasBackup, atlasPath),
      rm(notePath, { force: true }),
      rm(datasetTemp, { force: true }),
      rm(atlasTemp, { force: true }),
      rm(noteTemp, { force: true }),
    ]);
    throw error;
  }
  return {
    status: result.status,
    documentId,
    claimId,
    backupFiles: [basename(datasetBackup), basename(atlasBackup)],
  };
}

export async function createLocalManualVisitCandidate({
  journeyId,
  placeName,
  note,
  observedAt,
  config = localReviewDatasetConfigFromEnvironment(),
}: {
  journeyId: string;
  placeName: string;
  note: string;
  observedAt?: string;
  config?: LocalReviewDatasetConfig;
}) {
  if (!config.enabled || !config.rootPath || !config.relativePath || !config.atlasRelativePath || !isAbsolute(config.rootPath) || isAbsolute(config.relativePath) || isAbsolute(config.atlasRelativePath)) {
    throw new Error("Local review Dataset and Atlas must be configured.");
  }
  const root = await realpath(config.rootPath);
  const datasetPath = await realpath(resolve(root, config.relativePath));
  const atlasPath = await realpath(resolve(root, config.atlasRelativePath));
  if (!inside(root, datasetPath) || !inside(root, atlasPath)) throw new Error("Review files must stay inside the configured root.");
  const dataset = await loadLocalKnowledgeDataset(config);
  const atlas = ReviewAtlasSchema.parse(JSON.parse(await readFile(atlasPath, "utf8")));
  const journey = atlas.journeys?.find(({ id }) => id === journeyId);
  if (!journey) throw new Error(`Unknown Journey: ${journeyId}`);
  const normalizedPlace = placeName.trim();
  const normalizedNote = note.trim();
  const digest = createHash("sha256").update(`${journeyId}\n${normalizedPlace}\n${normalizedNote}`, "utf8").digest("hex");
  const suffix = digest.slice(0, 20);
  const documentId = `document-manual-${suffix}`;
  const claimId = `claim-manual-${suffix}`;
  const relativePath = `.resoworld/manual-notes/${documentId}.txt`;
  const result = materializeNewManualVisitCandidate({ dataset, input: {
    journeyId, journeyLabel: journey.label, placeName: normalizedPlace, note: normalizedNote,
    documentId, claimId, relativePath,
    documentSha256: createHash("sha256").update(normalizedNote, "utf8").digest("hex"),
    createdAt: new Date().toISOString(), observedAt,
  } });
  const candidateFile = `manual-${suffix}.journey-candidate.json`;
  const notePath = resolve(root, relativePath);
  const candidatePath = resolve(root, candidateFile);
  if (!inside(root, notePath) || !inside(root, candidatePath)) throw new Error("Manual visit files must stay inside the configured root.");
  await mkdir(dirname(notePath), { recursive: true });
  const stamp = Date.now();
  const datasetBackup = join(root, `${basename(config.relativePath, ".json")}.before-manual-candidate-${stamp}.json`);
  const datasetTemp = `${datasetPath}.manual-candidate-${stamp}.tmp`;
  const noteTemp = `${notePath}.${stamp}.tmp`;
  const candidateTemp = `${candidatePath}.${stamp}.tmp`;
  await Promise.all([
    copyFile(datasetPath, datasetBackup),
    writeFile(datasetTemp, JSON.stringify(result.dataset, null, 2) + "\n", "utf8"),
    writeFile(noteTemp, normalizedNote + "\n", "utf8"),
    writeFile(candidateTemp, JSON.stringify(result.candidate, null, 2) + "\n", "utf8"),
  ]);
  try {
    await rename(noteTemp, notePath);
    await rename(candidateTemp, candidatePath);
    await rename(datasetTemp, datasetPath);
  } catch (error) {
    await Promise.allSettled([
      copyFile(datasetBackup, datasetPath), rm(notePath, { force: true }), rm(candidatePath, { force: true }),
      rm(datasetTemp, { force: true }), rm(noteTemp, { force: true }), rm(candidateTemp, { force: true }),
    ]);
    throw error;
  }
  return { status: result.status, documentId, claimId, candidateFile, backupFiles: [basename(datasetBackup)] };
}
