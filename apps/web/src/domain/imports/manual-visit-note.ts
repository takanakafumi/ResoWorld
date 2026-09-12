import { KnowledgeDatasetSchema, SCHEMA_VERSION, type KnowledgeDataset } from "@/domain/knowledge/schema";
import type { ReviewAtlas } from "@/domain/review/types";

export type ManualVisitNoteInput = {
  journeyId: string;
  spotId: string;
  note: string;
  documentId: string;
  claimId: string;
  documentSha256: string;
  relativePath: string;
  createdAt: string;
  observedAt?: string;
};

export function materializeManualVisitNote({
  dataset,
  atlas,
  input,
}: {
  dataset: KnowledgeDataset;
  atlas: ReviewAtlas;
  input: ManualVisitNoteInput;
}) {
  const note = input.note.trim();
  if (!note) throw new Error("Manual visit note is empty.");
  const journey = atlas.journeys?.find(({ id }) => id === input.journeyId);
  if (!journey) throw new Error(`Unknown Journey: ${input.journeyId}`);
  const spot = atlas.spots.find(({ id }) => id === input.spotId);
  if (!spot) throw new Error(`Unknown Spot: ${input.spotId}`);
  if (dataset.documents.some(({ sha256 }) => sha256 === input.documentSha256)) {
    return { dataset, atlas, status: "unchanged" as const };
  }
  if (dataset.documents.some(({ id }) => id === input.documentId) || dataset.claims.some(({ id }) => id === input.claimId)) {
    throw new Error("Manual visit note ID conflicts with existing data.");
  }

  const lineCount = note.split(/\r?\n/).length;
  const nextDataset = KnowledgeDatasetSchema.parse({
    ...dataset,
    documents: [...dataset.documents, {
      id: input.documentId,
      title: `${spot.name}の訪問追記`,
      path: input.relativePath,
      sha256: input.documentSha256,
      authorType: "user-authored",
      privacy: "private",
      observedAt: input.observedAt ?? null,
      documentedAt: input.createdAt.slice(0, 10),
      dateStatus: input.observedAt ? "known" : "not-present-in-source",
    }],
    claims: [...dataset.claims, {
      schemaVersion: SCHEMA_VERSION,
      id: input.claimId,
      statement: note,
      subject: { name: spot.name, type: "Place" },
      predicate: "visited",
      object: { kind: "literal", value: true },
      qualifiers: { manualVisitNote: true },
      claimKind: "observation",
      originType: "user",
      reviewStatus: "confirmed",
      epistemic: { verification: "personal-evidence", modality: "asserted" },
      historicalTime: null,
      places: [{ name: spot.name, role: "observed_place" }],
      evidence: [{
        id: `evidence-${input.claimId}`,
        role: "supports",
        sourceNature: "Observation",
        documentVoice: "user-narrator",
        passage: {
          documentId: input.documentId,
          documentSha256: input.documentSha256,
          startLine: 1,
          endLine: lineCount,
          quote: note,
        },
      }],
      createdAt: input.createdAt,
    }],
  });
  const nextAtlas: ReviewAtlas = {
    ...atlas,
    spots: atlas.spots.map((candidate) => candidate.id === spot.id
      ? { ...candidate, claimIds: [...new Set([...candidate.claimIds, input.claimId])] }
      : candidate),
    journeys: (atlas.journeys ?? []).map((candidate) => candidate.id === journey.id
      ? {
          ...candidate,
          documentIds: [...new Set([...candidate.documentIds, input.documentId])],
          spotIds: [...new Set([...candidate.spotIds, spot.id])],
        }
      : candidate),
  };
  return { dataset: nextDataset, atlas: nextAtlas, status: "added" as const };
}
