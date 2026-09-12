import { hasRegisteredLensMaterial } from "@/domain/lenses/topic-resolver";
import { registeredLensKnowledgePacks } from "@/domain/lens-packs/knowledge-registry";
import { resolveApplicableLensPresets } from "@/domain/lens-packs/preset-selection";
import type { ReviewDataset, ReviewJourney } from "@/domain/review/types";

const LENSES = ["mythology", "religion", "route", "politics", "people"] as const;
const knownEntityKinds = new Map(registeredLensKnowledgePacks.flatMap(({ pack }) =>
  pack.entities.map((entity) => [entity.id, entity.kind] as const),
));

export type JourneyCoverageIssue = {
  severity: "error" | "warning" | "info";
  code:
    | "missing-document"
    | "missing-spot"
    | "missing-connection"
    | "spot-without-claims"
    | "missing-claim"
    | "unassigned-document"
    | "unassigned-spot"
    | "unassigned-connection"
    | "observed-place-not-mapped"
    | "no-lens-material";
  message: string;
  referenceId?: string;
};

export type JourneyCoverageAudit = {
  journeyId: string;
  journeyLabel: string;
  documentCount: number;
  spotCount: number;
  connectionCount: number;
  lensIds: string[];
  lensMatches: Array<{
    lensId: string;
    presetId: string;
    label: string;
    claimCount: number;
    spotCount: number;
    spotNames: string[];
    claimStatements: string[];
  }>;
  lensGaps: Array<{ lensId: string; entityKinds: string[]; exampleLabels: string[] }>;
  issues: JourneyCoverageIssue[];
};

export type DatasetCoverageAudit = {
  issues: JourneyCoverageIssue[];
  mappedObservedPlaceCount: number;
  observedPlaceCount: number;
};

function scopedClaims(dataset: ReviewDataset, journey: ReviewJourney) {
  const documentIds = new Set(journey.documentIds);
  return dataset.claims.filter((claim) =>
    claim.evidence.some((evidence) => documentIds.has(evidence.passage.documentId)),
  );
}

export function auditJourneyCoverage(dataset: ReviewDataset): JourneyCoverageAudit[] {
  const atlas = dataset.atlas;
  if (!atlas) return [];
  const documentIds = new Set(dataset.documents.map((document) => document.id));
  const claimIds = new Set(dataset.claims.map((claim) => claim.id));
  const claimById = new Map(dataset.claims.map((claim) => [claim.id, claim]));
  const spotById = new Map(atlas.spots.map((spot) => [spot.id, spot]));
  const connectionById = new Map(atlas.connections.map((connection) => [connection.id, connection]));

  return (atlas.journeys ?? []).map((journey) => {
    const issues: JourneyCoverageIssue[] = [];
    for (const id of journey.documentIds) {
      if (!documentIds.has(id)) issues.push({ severity: "error", code: "missing-document", referenceId: id, message: `文書参照が見つかりません: ${id}` });
    }
    const spots = journey.spotIds.flatMap((id) => {
      const spot = spotById.get(id);
      if (!spot) {
        issues.push({ severity: "error", code: "missing-spot", referenceId: id, message: `訪問地点参照が見つかりません: ${id}` });
        return [];
      }
      if (spot.claimIds.length === 0) issues.push({ severity: "warning", code: "spot-without-claims", referenceId: id, message: `訪問地点「${spot.name}」に根拠Claimがありません。` });
      for (const claimId of spot.claimIds) {
        if (!claimIds.has(claimId)) issues.push({ severity: "error", code: "missing-claim", referenceId: claimId, message: `訪問地点「${spot.name}」のClaim参照が見つかりません: ${claimId}` });
      }
      return [spot];
    });
    const connections = journey.connectionIds.flatMap((id) => {
      const connection = connectionById.get(id);
      if (!connection) {
        issues.push({ severity: "error", code: "missing-connection", referenceId: id, message: `接続参照が見つかりません: ${id}` });
        return [];
      }
      for (const spotId of connection.spotIds) {
        if (!spotById.has(spotId)) issues.push({ severity: "error", code: "missing-spot", referenceId: spotId, message: `接続「${connection.title}」の地点参照が見つかりません: ${spotId}` });
      }
      for (const claimId of connection.claimIds) {
        if (!claimIds.has(claimId)) issues.push({ severity: "error", code: "missing-claim", referenceId: claimId, message: `接続「${connection.title}」のClaim参照が見つかりません: ${claimId}` });
      }
      return [connection];
    });
    const claims = scopedClaims(dataset, journey);
    const lensMatches = registeredLensKnowledgePacks.flatMap((registration) => {
      const allowed = "presetIds" in registration ? new Set<string>(registration.presetIds) : null;
      return resolveApplicableLensPresets(registration.pack, claims, spots).flatMap((match) => {
        if (allowed && !allowed.has(match.presetId)) return [];
        const preset = registration.pack.presets.find(({ id }) => id === match.presetId);
        return preset ? [{
          lensId: registration.lensId,
          presetId: match.presetId,
          label: preset.label,
          claimCount: match.claimIds.length,
          spotCount: match.spotIds.length,
          spotNames: match.spotIds.flatMap((id) => {
            const spot = spotById.get(id);
            return spot ? [spot.name] : [];
          }),
          claimStatements: match.claimIds.flatMap((id) => {
            const claim = claimById.get(id);
            return claim ? [claim.statement] : [];
          }),
        }] : [];
      });
    });
    const lensIds = LENSES.filter((lensId) => hasRegisteredLensMaterial({ lensId, claims, spots }));
    const matchedLensIds = new Set(lensMatches.map(({ lensId }) => lensId));
    const lensGaps = lensMatches.length > 0 ? [] : LENSES.map((lensId) => {
      const registrations = registeredLensKnowledgePacks.filter((registration) => registration.lensId === lensId);
      const roots = registrations.flatMap((registration) => {
        const allowed = "presetIds" in registration ? new Set<string>(registration.presetIds) : null;
        const rootIds = new Set(registration.pack.presets.filter(({ id }) => !allowed || allowed.has(id)).flatMap(({ rootEntityIds }) => rootEntityIds));
        return registration.pack.entities.filter(({ id }) => rootIds.has(id));
      });
      return {
        lensId,
        entityKinds: [...new Set(roots.map(({ kind }) => kind))],
        exampleLabels: [...new Set(roots.map(({ label }) => label))].slice(0, 3),
      };
    }).filter(({ lensId, exampleLabels }) => !matchedLensIds.has(lensId) && exampleLabels.length > 0);
    if (lensIds.length === 0) issues.push({ severity: "info", code: "no-lens-material", message: "既存LENSへ接続する材料はまだありません。訪問地点とClaimはそのまま利用できます。" });

    return {
      journeyId: journey.id,
      journeyLabel: journey.label,
      documentCount: journey.documentIds.filter((id) => documentIds.has(id)).length,
      spotCount: spots.length,
      connectionCount: connections.length,
      lensIds: [...lensIds],
      lensMatches,
      lensGaps,
      issues,
    };
  });
}

export function auditDatasetCoverage(dataset: ReviewDataset): DatasetCoverageAudit {
  const atlas = dataset.atlas;
  if (!atlas) return { issues: [], mappedObservedPlaceCount: 0, observedPlaceCount: 0 };
  const journeys = atlas.journeys ?? [];
  const assignedDocumentIds = new Set(journeys.flatMap((journey) => journey.documentIds));
  const assignedSpotIds = new Set(journeys.flatMap((journey) => journey.spotIds));
  const assignedConnectionIds = new Set(journeys.flatMap((journey) => journey.connectionIds));
  const issues: JourneyCoverageIssue[] = [];

  for (const document of dataset.documents) {
    if (!assignedDocumentIds.has(document.id)) issues.push({ severity: "warning", code: "unassigned-document", referenceId: document.id, message: `文書「${document.title}」がどのJourneyにも所属していません。` });
  }
  for (const spot of atlas.spots) {
    if (!assignedSpotIds.has(spot.id)) issues.push({ severity: "warning", code: "unassigned-spot", referenceId: spot.id, message: `訪問地点「${spot.name}」がどのJourneyにも所属していません。` });
  }
  for (const connection of atlas.connections) {
    if (!assignedConnectionIds.has(connection.id)) issues.push({ severity: "warning", code: "unassigned-connection", referenceId: connection.id, message: `接続「${connection.title}」がどのJourneyにも所属していません。` });
  }

  const observedPlaces = new Map<string, { name: string; claimIds: Set<string> }>();
  for (const claim of dataset.claims) {
    if (claim.reviewStatus === "rejected" || claim.claimKind !== "observation") continue;
    for (const place of claim.places) {
      if (place.role !== "observed_place") continue;
      if (place.entityId && knownEntityKinds.has(place.entityId) && knownEntityKinds.get(place.entityId) !== "place") continue;
      const key = place.entityId ? `id:${place.entityId}` : `name:${place.name.trim().toLocaleLowerCase("ja")}`;
      const current = observedPlaces.get(key) ?? { name: place.name, claimIds: new Set<string>() };
      current.claimIds.add(claim.id);
      observedPlaces.set(key, current);
    }
  }
  const mappedClaimIds = new Set(atlas.spots.flatMap((spot) => spot.claimIds));
  let mappedObservedPlaceCount = 0;
  for (const place of observedPlaces.values()) {
    const mapped = [...place.claimIds].some((claimId) => mappedClaimIds.has(claimId));
    if (mapped) mappedObservedPlaceCount += 1;
    else issues.push({ severity: "warning", code: "observed-place-not-mapped", message: `訪問記録「${place.name}」に対応するMAP地点がありません。` });
  }

  return { issues, mappedObservedPlaceCount, observedPlaceCount: observedPlaces.size };
}
