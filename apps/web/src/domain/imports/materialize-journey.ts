import type { JourneyRegistrationDraft } from "./journey-candidate";
import { journeyPlaceCandidateKey } from "./journey-candidate";
import type { ReviewAtlas, ReviewAtlasSpot } from "@/domain/review/types";
import type { Claim } from "@/domain/knowledge/schema";

function unique(values: string[]) {
  return [...new Set(values)];
}

export function inferSpotKind(name: string, claims: Claim[] = []) {
  const relatedNames = claims.flatMap((claim) => [
    claim.subject.name,
    claim.object.kind === "entity" ? claim.object.entity.name : "",
  ]).join(" ");
  const classificationText = `${name} ${relatedNames}`;
  if (/博物館|資料館|歴史館/.test(name)) return "博物館・歴史資料館";
  if (/歴史公園/.test(name)) return "遺跡・歴史公園";
  if (/遺跡|古墳|墳墓|王墓/.test(classificationText)) return "遺跡・古墳";
  if (/神社|大社|神宮/.test(name)) return "神社";
  if (/寺|院/.test(name)) return "寺院";
  return "訪問地点";
}

function spotRegion(address: Record<string, string>) {
  return unique([
    address.province ?? address.state ?? "",
    address.city ?? address.town ?? address.village ?? address.county ?? "",
  ].filter(Boolean)).join(" · ") || "地域未確認";
}

function spotId(candidate: JourneyRegistrationDraft["placeCandidates"][number], providerId: string) {
  return `spot-${candidate.entityId ?? providerId.replace(/[^a-zA-Z0-9-]/g, "-")}`;
}

function claimConcepts(claim: Claim) {
  const object = claim.object.kind === "entity"
    ? claim.object.entity.name
    : String(claim.object.value);
  return unique([claim.subject.name, object].filter(Boolean));
}

function claimEra(claim: Claim, spotIds: string[]) {
  if (!claim.historicalTime || claim.historicalTime.kind === "unknown") return [];
  const label = claim.historicalTime.kind === "named"
    ? claim.historicalTime.label
    : claim.historicalTime.label ?? "暦年代";
  const range = claim.historicalTime.kind === "calendar"
    ? `${claim.historicalTime.approximate ? "約" : ""}${claim.historicalTime.startYear}年${claim.historicalTime.endYear === undefined ? "" : `–${claim.historicalTime.endYear}年`}`
    : claim.historicalTime.label;
  return [{
    id: `era-${claim.id}`,
    label,
    range,
    mapLabel: label,
    mapLayer: "present" as const,
    spotIds,
    claimIds: [claim.id],
  }];
}

export function proposeSharedClaimConnections(spots: ReviewAtlasSpot[], claims: Claim[]) {
  const claimById = new Map(claims.map((claim) => [claim.id, claim]));
  const spotIdsByClaim = new Map<string, string[]>();
  for (const spot of spots) {
    for (const claimId of spot.claimIds) {
      const current = spotIdsByClaim.get(claimId) ?? [];
      if (!current.includes(spot.id)) current.push(spot.id);
      spotIdsByClaim.set(claimId, current);
    }
  }
  return [...spotIdsByClaim.entries()].flatMap(([claimId, spotIds]) => {
    const claim = claimById.get(claimId);
    if (!claim || spotIds.length < 2) return [];
    const names = spotIds.map((id) => spots.find((spot) => spot.id === id)?.name).filter(Boolean);
    return [{
      id: `connection-evidence-${claimId}`,
      connectionKind: "documented" as const,
      initialStatus: "suggested" as const,
      eyebrow: "旅行記に共通する記録",
      title: names.join("と"),
      summary: claim.statement,
      spotIds,
      claimIds: [claim.id],
      concepts: claimConcepts(claim),
      facets: [{ id: "shared-record", label: "共通する記録", weight: 3 }],
      eras: claimEra(claim, spotIds),
    }];
  });
}

export function materializeJourneyRegistration(atlas: ReviewAtlas, draft: JourneyRegistrationDraft, claims: Claim[] = []): ReviewAtlas {
  const resolvedSpots = draft.placeCandidates.flatMap((candidate) => {
    const resolution = draft.placeResolutions[journeyPlaceCandidateKey(candidate)];
    if (!resolution) return [];
    return [{
      id: spotId(candidate, resolution.selected.id),
      name: candidate.name,
      region: spotRegion(resolution.selected.address),
      kind: inferSpotKind(candidate.name, claims.filter((claim) => candidate.claimIds.includes(claim.id))),
      latitude: resolution.selected.latitude,
      longitude: resolution.selected.longitude,
      claimIds: candidate.claimIds,
      positionStatus: "candidate" as const,
    }];
  });

  const spotById = new Map(atlas.spots.map((spot) => [spot.id, spot]));
  for (const spot of resolvedSpots) {
    const existing = spotById.get(spot.id);
    spotById.set(spot.id, existing ? { ...existing, claimIds: unique([...existing.claimIds, ...spot.claimIds]) } : spot);
  }

  const journeySpotIds = resolvedSpots.map((spot) => spot.id);
  const proposedConnections = draft.connectionDecision === "review_thematic_connection"
    ? proposeSharedClaimConnections(resolvedSpots, claims)
    : [];
  const connectionById = new Map(atlas.connections.map((connection) => [connection.id, connection]));
  for (const connection of proposedConnections) {
    if (!connectionById.has(connection.id)) connectionById.set(connection.id, connection);
  }
  const journeys = [...(atlas.journeys ?? [])];
  const existingJourneyIndex = journeys.findIndex((journey) => journey.id === draft.targetJourney.id);
  const current = existingJourneyIndex >= 0 ? journeys[existingJourneyIndex] : undefined;
  const nextJourney = {
    id: draft.targetJourney.id,
    label: draft.targetJourney.label,
    documentIds: unique([...(current?.documentIds ?? []), ...draft.documentIds]),
    spotIds: unique([...(current?.spotIds ?? []), ...journeySpotIds]),
    connectionIds: unique([...(current?.connectionIds ?? []), ...proposedConnections.map((connection) => connection.id)]),
  };
  if (existingJourneyIndex >= 0) journeys[existingJourneyIndex] = nextJourney;
  else journeys.push(nextJourney);

  return { ...atlas, journeys, spots: [...spotById.values()], connections: [...connectionById.values()] };
}

export function materializedSpotIds(draft: JourneyRegistrationDraft): string[] {
  return draft.placeCandidates.flatMap((candidate) => {
    const resolution = draft.placeResolutions[journeyPlaceCandidateKey(candidate)];
    return resolution ? [spotId(candidate, resolution.selected.id)] : [];
  });
}

export type MaterializedJourneySpot = ReviewAtlasSpot;
