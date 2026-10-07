import "server-only";

import { copyFile, mkdir, readFile, realpath, rename, rm, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { basename, dirname, isAbsolute, join, relative, resolve } from "node:path";

import { KnowledgeDatasetSchema, SCHEMA_VERSION, type KnowledgeDataset } from "@/domain/knowledge/schema";
import { ReviewAtlasSchema, localReviewDatasetConfigFromEnvironment, type LocalReviewDatasetConfig } from "./local-dataset";
import { loadLocalKnowledgeDataset } from "./knowledge-dataset";
import type { ReviewAtlas } from "@/domain/review/types";

function inside(root: string, target: string) {
  const value = relative(root, target);
  return !value.startsWith("..") && !isAbsolute(value);
}

export type QuickVisitSpotInput = {
  name: string;
  latitude: number;
  longitude: number;
  region?: string;
  kind?: string;
  journeyId?: string;
  note?: string;
  observedAt?: string;
  config?: LocalReviewDatasetConfig;
};

export async function applyQuickVisitSpot({
  name,
  latitude,
  longitude,
  region,
  kind,
  journeyId,
  note,
  observedAt,
  config = localReviewDatasetConfigFromEnvironment(),
}: QuickVisitSpotInput) {
  if (
    !config.enabled ||
    !config.rootPath ||
    !config.relativePath ||
    !config.atlasRelativePath ||
    !isAbsolute(config.rootPath) ||
    isAbsolute(config.relativePath) ||
    isAbsolute(config.atlasRelativePath)
  ) {
    throw new Error("Local review Dataset and Atlas must be configured.");
  }

  const root = await realpath(config.rootPath);
  const datasetPath = await realpath(resolve(root, config.relativePath));
  const atlasPath = await realpath(resolve(root, config.atlasRelativePath));

  if (!inside(root, datasetPath) || !inside(root, atlasPath)) {
    throw new Error("Review files must stay inside the configured root.");
  }

  const dataset = await loadLocalKnowledgeDataset(config);
  const atlas = ReviewAtlasSchema.parse(JSON.parse(await readFile(atlasPath, "utf8")));

  const normalizedName = name.trim();
  const effectiveNote = (note?.trim() || `${normalizedName}を現地訪問した記録`).trim();

  // Find target journey: explicit journeyId or default to yamatai / first journey
  const targetJourney =
    (journeyId && atlas.journeys?.find((j) => j.id === journeyId)) ||
    atlas.journeys?.find((j) => j.id === "yamatai") ||
    atlas.journeys?.[0];

  if (!targetJourney) {
    throw new Error("No target Journey found in Atlas.");
  }

  const digest = createHash("sha256")
    .update(`${targetJourney.id}\n${normalizedName}\n${latitude.toFixed(4)}\n${longitude.toFixed(4)}`, "utf8")
    .digest("hex");
  const suffix = digest.slice(0, 16);
  const documentId = `document-manual-${suffix}`;
  const claimId = `claim-manual-${suffix}`;
  const spotId = `spot-quick-${suffix}`;
  const relativePath = `.resoworld/manual-notes/${documentId}.txt`;
  const createdAt = new Date().toISOString();

  // Create document & claim
  const document = {
    id: documentId,
    title: `${normalizedName}の訪問追記`,
    path: relativePath,
    sha256: createHash("sha256").update(effectiveNote, "utf8").digest("hex"),
    authorType: "user-authored" as const,
    privacy: "private" as const,
    observedAt: observedAt ?? null,
    documentedAt: createdAt.slice(0, 10),
    dateStatus: observedAt ? ("known" as const) : ("not-present-in-source" as const),
  };

  const claim = {
    schemaVersion: SCHEMA_VERSION,
    id: claimId,
    statement: effectiveNote,
    subject: { name: normalizedName, type: "Place" as const },
    predicate: "visited",
    object: { kind: "literal" as const, value: true },
    qualifiers: { manualVisitNote: true },
    claimKind: "observation" as const,
    originType: "user" as const,
    reviewStatus: "confirmed" as const,
    epistemic: { verification: "personal-evidence" as const, modality: "asserted" as const },
    historicalTime: null,
    places: [{ name: normalizedName, role: "observed_place" as const }],
    evidence: [
      {
        id: `evidence-${claimId}`,
        role: "supports" as const,
        sourceNature: "Observation" as const,
        documentVoice: "user-narrator" as const,
        passage: {
          documentId,
          documentSha256: document.sha256,
          startLine: 1,
          endLine: effectiveNote.split(/\r?\n/).length,
          quote: effectiveNote,
        },
      },
    ],
    createdAt,
  };

  const newSpot = {
    id: spotId,
    name: normalizedName,
    region: region || "訪問地点",
    kind: kind || "神社・祭祀",
    latitude,
    longitude,
    claimIds: [claimId],
    mapRole: "visited-place" as const,
    positionStatus: "confirmed" as const,
  };

  // Check if spot or document already exists
  const existingSpot = atlas.spots.find((s) => s.name === normalizedName);
  let updatedSpots = [...atlas.spots];
  let effectiveSpotId = spotId;

  if (existingSpot) {
    effectiveSpotId = existingSpot.id;
    updatedSpots = updatedSpots.map((s) =>
      s.id === existingSpot.id
        ? { ...s, claimIds: [...new Set([...s.claimIds, claimId])], positionStatus: "confirmed" as const }
        : s,
    );
  } else {
    updatedSpots.push(newSpot);
  }

  const updatedJourneys = (atlas.journeys ?? []).map((j) =>
    j.id === targetJourney.id
      ? {
          ...j,
          documentIds: [...new Set([...j.documentIds, documentId])],
          spotIds: [...new Set([...j.spotIds, effectiveSpotId])],
        }
      : j,
  );

  const nextAtlas: ReviewAtlas = {
    ...atlas,
    spots: updatedSpots,
    journeys: updatedJourneys,
  };

  const nextDataset = KnowledgeDatasetSchema.parse({
    ...dataset,
    documents: dataset.documents.some((d) => d.id === documentId)
      ? dataset.documents
      : [...dataset.documents, document],
    claims: dataset.claims.some((c) => c.id === claimId) ? dataset.claims : [...dataset.claims, claim],
  });

  const notePath = resolve(root, relativePath);
  if (!inside(root, notePath)) throw new Error("Manual note path must stay inside the configured root.");
  await mkdir(dirname(notePath), { recursive: true });

  const stamp = Date.now();
  const datasetBackup = join(root, `${basename(config.relativePath, ".json")}.before-quick-visit-${stamp}.json`);
  const atlasBackup = join(root, `${basename(config.atlasRelativePath, ".json")}.before-quick-visit-${stamp}.json`);
  const datasetTemp = `${datasetPath}.quick-visit-${stamp}.tmp`;
  const atlasTemp = `${atlasPath}.quick-visit-${stamp}.tmp`;
  const noteTemp = `${notePath}.${stamp}.tmp`;

  await Promise.all([
    copyFile(datasetPath, datasetBackup),
    copyFile(atlasPath, atlasBackup),
    writeFile(datasetTemp, JSON.stringify(nextDataset, null, 2) + "\n", "utf8"),
    writeFile(atlasTemp, JSON.stringify(ReviewAtlasSchema.parse(nextAtlas), null, 2) + "\n", "utf8"),
    writeFile(noteTemp, effectiveNote + "\n", "utf8"),
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

  // Also sync to published fallback if present
  try {
    const publishedPath = resolve(root, "../apps/web/src/data/published-review-dataset.json");
    const publishedRaw = await readFile(publishedPath, "utf8").catch(() => null);
    if (publishedRaw) {
      const published = JSON.parse(publishedRaw);
      published.documents = nextDataset.documents;
      published.claims = nextDataset.claims;
      published.atlas = nextAtlas;
      await writeFile(publishedPath, JSON.stringify(published, null, 2) + "\n", "utf8");
    }
  } catch {
    // published sync is best-effort
  }

  return {
    status: "added" as const,
    spotId: effectiveSpotId,
    spotName: normalizedName,
    documentId,
    claimId,
    backupFiles: [basename(datasetBackup), basename(atlasBackup)],
  };
}
