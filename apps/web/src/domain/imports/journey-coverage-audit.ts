import { hasRegisteredLensMaterial } from "@/domain/lenses/topic-resolver";
import type { ReviewDataset, ReviewJourney } from "@/domain/review/types";

const LENSES = ["mythology", "religion", "route", "politics", "people"] as const;

export type JourneyCoverageIssue = {
  severity: "error" | "warning" | "info";
  code:
    | "missing-document"
    | "missing-spot"
    | "missing-connection"
    | "spot-without-claims"
    | "missing-claim"
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
  issues: JourneyCoverageIssue[];
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
    const lensIds = LENSES.filter((lensId) => hasRegisteredLensMaterial({ lensId, claims, spots }));
    if (lensIds.length === 0) issues.push({ severity: "info", code: "no-lens-material", message: "既存LENSへ接続する材料はまだありません。訪問地点とClaimはそのまま利用できます。" });

    return {
      journeyId: journey.id,
      journeyLabel: journey.label,
      documentCount: journey.documentIds.filter((id) => documentIds.has(id)).length,
      spotCount: spots.length,
      connectionCount: connections.length,
      lensIds: [...lensIds],
      issues,
    };
  });
}
