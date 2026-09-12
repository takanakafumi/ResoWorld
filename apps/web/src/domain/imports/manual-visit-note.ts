import { KnowledgeDatasetSchema, SCHEMA_VERSION, type KnowledgeDataset } from "@/domain/knowledge/schema";
import type { ReviewAtlas } from "@/domain/review/types";
import { JourneyImportCandidateSchema } from "./journey-candidate";

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

export type NewManualVisitNoteInput = Omit<ManualVisitNoteInput, "spotId"> & {
  journeyLabel: string;
  placeName: string;
};

function manualDocumentAndClaim(input: Omit<ManualVisitNoteInput, "journeyId" | "spotId">, placeName: string) {
  const note = input.note.trim();
  if (!note) throw new Error("Manual visit note is empty.");
  const lineCount = note.split(/\r?\n/).length;
  const document = {
    id: input.documentId,
    title: `${placeName}の訪問追記`,
    path: input.relativePath,
    sha256: input.documentSha256,
    authorType: "user-authored" as const,
    privacy: "private" as const,
    observedAt: input.observedAt ?? null,
    documentedAt: input.createdAt.slice(0, 10),
    dateStatus: input.observedAt ? "known" as const : "not-present-in-source" as const,
  };
  const claim = {
    schemaVersion: SCHEMA_VERSION,
    id: input.claimId,
    statement: note,
    subject: { name: placeName, type: "Place" as const },
    predicate: "visited",
    object: { kind: "literal" as const, value: true },
    qualifiers: { manualVisitNote: true },
    claimKind: "observation" as const,
    originType: "user" as const,
    reviewStatus: "confirmed" as const,
    epistemic: { verification: "personal-evidence" as const, modality: "asserted" as const },
    historicalTime: null,
    places: [{ name: placeName, role: "observed_place" as const }],
    evidence: [{
      id: `evidence-${input.claimId}`,
      role: "supports" as const,
      sourceNature: "Observation" as const,
      documentVoice: "user-narrator" as const,
      passage: { documentId: input.documentId, documentSha256: input.documentSha256, startLine: 1, endLine: lineCount, quote: note },
    }],
    createdAt: input.createdAt,
  };
  return { note, document, claim };
}

export function materializeManualVisitNote({
  dataset,
  atlas,
  input,
}: {
  dataset: KnowledgeDataset;
  atlas: ReviewAtlas;
  input: ManualVisitNoteInput;
}) {
  const journey = atlas.journeys?.find(({ id }) => id === input.journeyId);
  if (!journey) throw new Error(`Unknown Journey: ${input.journeyId}`);
  const spot = atlas.spots.find(({ id }) => id === input.spotId);
  if (!spot) throw new Error(`Unknown Spot: ${input.spotId}`);
  const { document, claim } = manualDocumentAndClaim(input, spot.name);
  if (dataset.documents.some(({ sha256 }) => sha256 === input.documentSha256)) {
    return { dataset, atlas, status: "unchanged" as const };
  }
  if (dataset.documents.some(({ id }) => id === input.documentId) || dataset.claims.some(({ id }) => id === input.claimId)) {
    throw new Error("Manual visit note ID conflicts with existing data.");
  }

  const nextDataset = KnowledgeDatasetSchema.parse({
    ...dataset,
    documents: [...dataset.documents, document],
    claims: [...dataset.claims, claim],
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

export function materializeNewManualVisitCandidate({ dataset, input }: { dataset: KnowledgeDataset; input: NewManualVisitNoteInput }) {
  const placeName = input.placeName.trim();
  if (!placeName) throw new Error("Manual visit place name is empty.");
  const { document, claim } = manualDocumentAndClaim(input, placeName);
  if (dataset.documents.some(({ sha256 }) => sha256 === input.documentSha256)) throw new Error("The same manual visit note already exists.");
  const nextDataset = KnowledgeDatasetSchema.parse({ ...dataset, documents: [...dataset.documents, document], claims: [...dataset.claims, claim] });
  const candidate = JourneyImportCandidateSchema.parse({
    id: input.journeyId,
    label: input.journeyLabel,
    documentIds: [input.documentId],
    claimIds: [input.claimId],
    placeCandidates: [{ name: placeName, roles: ["observed_place"], claimIds: [input.claimId] }],
    entityTypes: [{ type: "Place", count: 1 }],
    lensDecision: "review_required",
  });
  return { dataset: nextDataset, candidate, status: "added" as const };
}
