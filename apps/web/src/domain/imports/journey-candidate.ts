import type { ParsedExplorationDocument } from "./types";
import type { Claim } from "@/domain/knowledge/schema";

export type JourneyImportCandidate = {
  id: string;
  label: string;
  documentIds: string[];
  claimIds: string[];
  placeCandidates: {
    name: string;
    entityId?: string;
    roles: Claim["places"][number]["role"][];
    claimIds: string[];
  }[];
  entityTypes: { type: string; count: number }[];
  lensDecision: "review_required";
};

export function buildJourneyImportCandidate(
  document: ParsedExplorationDocument,
  claims: Claim[],
): JourneyImportCandidate {
  const documentClaims = claims.filter((claim) =>
    claim.evidence.some((evidence) => evidence.passage.documentId === document.id),
  );
  const places = new Map<string, JourneyImportCandidate["placeCandidates"][number]>();
  const entityTypeCounts = new Map<string, number>();

  for (const claim of documentClaims) {
    entityTypeCounts.set(claim.subject.type, (entityTypeCounts.get(claim.subject.type) ?? 0) + 1);
    if (claim.object.kind === "entity") {
      const type = claim.object.entity.type;
      entityTypeCounts.set(type, (entityTypeCounts.get(type) ?? 0) + 1);
    }
    for (const place of claim.places) {
      const key = place.entityId ?? place.name.normalize("NFKC").toLocaleLowerCase("ja");
      const current = places.get(key) ?? { name: place.name, entityId: place.entityId, roles: [], claimIds: [] };
      if (!current.roles.includes(place.role)) current.roles.push(place.role);
      if (!current.claimIds.includes(claim.id)) current.claimIds.push(claim.id);
      places.set(key, current);
    }
  }

  return {
    id: `journey-${document.id.replace(/^document-/, "")}`,
    label: document.title,
    documentIds: [document.id],
    claimIds: documentClaims.map((claim) => claim.id),
    placeCandidates: [...places.values()],
    entityTypes: [...entityTypeCounts.entries()]
      .map(([type, count]) => ({ type, count }))
      .sort((left, right) => right.count - left.count),
    lensDecision: "review_required",
  };
}

export type JourneyLensDecision = "reuse_existing" | "update_pack_or_preset" | "create_new_lens";

export type JourneyRegistrationDraft = {
  schemaVersion: "0.1.0";
  status: "reviewed_candidate";
  mode: "new" | "existing";
  targetJourney: { id: string; label: string };
  documentIds: string[];
  claimIds: string[];
  placeCandidates: JourneyImportCandidate["placeCandidates"];
  lensDecision: JourneyLensDecision;
};

export function journeyPlaceCandidateKey(place: JourneyImportCandidate["placeCandidates"][number]) {
  return place.entityId ?? place.name.normalize("NFKC").toLocaleLowerCase("ja");
}

export function buildJourneyRegistrationDraft(
  candidate: JourneyImportCandidate,
  input: {
    mode: "new" | "existing";
    targetJourney: { id: string; label: string };
    includedPlaceKeys: Iterable<string>;
    lensDecision: JourneyLensDecision;
  },
): JourneyRegistrationDraft {
  const includedPlaceKeys = new Set(input.includedPlaceKeys);
  return {
    schemaVersion: "0.1.0",
    status: "reviewed_candidate",
    mode: input.mode,
    targetJourney: input.targetJourney,
    documentIds: candidate.documentIds,
    claimIds: candidate.claimIds,
    placeCandidates: candidate.placeCandidates.filter((place) => includedPlaceKeys.has(journeyPlaceCandidateKey(place))),
    lensDecision: input.lensDecision,
  };
}
