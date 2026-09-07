import type { ParsedExplorationDocument } from "./types";
import type { Claim } from "@/domain/knowledge/schema";
import type { PlaceResolutionSelection } from "./place-resolution";

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

export function combineJourneyImportCandidates(
  candidates: JourneyImportCandidate[],
  identity: { id: string; label: string },
): JourneyImportCandidate {
  const places = new Map<string, JourneyImportCandidate["placeCandidates"][number]>();
  const entityTypeCounts = new Map<string, number>();
  for (const candidate of candidates) {
    for (const place of candidate.placeCandidates) {
      const key = journeyPlaceCandidateKey(place);
      const current = places.get(key) ?? {
        name: place.name,
        entityId: place.entityId,
        roles: [],
        claimIds: [],
      };
      for (const role of place.roles) if (!current.roles.includes(role)) current.roles.push(role);
      for (const claimId of place.claimIds) if (!current.claimIds.includes(claimId)) current.claimIds.push(claimId);
      places.set(key, current);
    }
    for (const entityType of candidate.entityTypes) {
      entityTypeCounts.set(entityType.type, (entityTypeCounts.get(entityType.type) ?? 0) + entityType.count);
    }
  }
  return {
    ...identity,
    documentIds: [...new Set(candidates.flatMap((candidate) => candidate.documentIds))],
    claimIds: [...new Set(candidates.flatMap((candidate) => candidate.claimIds))],
    placeCandidates: [...places.values()],
    entityTypes: [...entityTypeCounts.entries()]
      .map(([type, count]) => ({ type, count }))
      .sort((left, right) => right.count - left.count),
    lensDecision: "review_required",
  };
}

export type JourneyLensDecision = "reuse_existing" | "update_pack_or_preset" | "create_new_lens";
export type JourneyConnectionDecision = "no_connection" | "review_ordered_route" | "review_thematic_connection";

export type JourneyRegistrationDraft = {
  schemaVersion: "0.2.0";
  status: "reviewed_candidate";
  mode: "new" | "existing";
  targetJourney: { id: string; label: string };
  documentIds: string[];
  claimIds: string[];
  placeCandidates: JourneyImportCandidate["placeCandidates"];
  placeResolutions: Record<string, PlaceResolutionSelection>;
  connectionDecision: JourneyConnectionDecision;
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
    placeResolutions?: Record<string, PlaceResolutionSelection>;
    connectionDecision: JourneyConnectionDecision;
    lensDecision: JourneyLensDecision;
  },
): JourneyRegistrationDraft {
  const includedPlaceKeys = new Set(input.includedPlaceKeys);
  return {
    schemaVersion: "0.2.0",
    status: "reviewed_candidate",
    mode: input.mode,
    targetJourney: input.targetJourney,
    documentIds: candidate.documentIds,
    claimIds: candidate.claimIds,
    placeCandidates: candidate.placeCandidates.filter((place) => includedPlaceKeys.has(journeyPlaceCandidateKey(place))),
    placeResolutions: Object.fromEntries(
      Object.entries(input.placeResolutions ?? {}).filter(([key]) => includedPlaceKeys.has(key)),
    ),
    connectionDecision: input.connectionDecision,
    lensDecision: input.lensDecision,
  };
}
