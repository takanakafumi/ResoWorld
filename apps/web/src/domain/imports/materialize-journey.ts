import type { JourneyRegistrationDraft } from "./journey-candidate";
import { journeyPlaceCandidateKey } from "./journey-candidate";
import type { ReviewAtlas, ReviewAtlasSpot } from "@/domain/review/types";

function unique(values: string[]) {
  return [...new Set(values)];
}

function spotKind(name: string) {
  if (/博物館|資料館|歴史館/.test(name)) return "博物館・歴史資料館";
  if (/歴史公園/.test(name)) return "遺跡・歴史公園";
  if (/神社|大社|神宮/.test(name)) return "神社";
  if (/寺|院/.test(name)) return "寺院";
  if (/遺跡|古墳|墓/.test(name)) return "遺跡・古墳";
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

export function materializeJourneyRegistration(atlas: ReviewAtlas, draft: JourneyRegistrationDraft): ReviewAtlas {
  const resolvedSpots = draft.placeCandidates.flatMap((candidate) => {
    const resolution = draft.placeResolutions[journeyPlaceCandidateKey(candidate)];
    if (!resolution) return [];
    return [{
      id: spotId(candidate, resolution.selected.id),
      name: candidate.name,
      region: spotRegion(resolution.selected.address),
      kind: spotKind(candidate.name),
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
  const journeys = [...(atlas.journeys ?? [])];
  const existingJourneyIndex = journeys.findIndex((journey) => journey.id === draft.targetJourney.id);
  const current = existingJourneyIndex >= 0 ? journeys[existingJourneyIndex] : undefined;
  const nextJourney = {
    id: draft.targetJourney.id,
    label: draft.targetJourney.label,
    documentIds: unique([...(current?.documentIds ?? []), ...draft.documentIds]),
    spotIds: unique([...(current?.spotIds ?? []), ...journeySpotIds]),
    connectionIds: current?.connectionIds ?? [],
  };
  if (existingJourneyIndex >= 0) journeys[existingJourneyIndex] = nextJourney;
  else journeys.push(nextJourney);

  return { ...atlas, journeys, spots: [...spotById.values()] };
}

export function materializedSpotIds(draft: JourneyRegistrationDraft): string[] {
  return draft.placeCandidates.flatMap((candidate) => {
    const resolution = draft.placeResolutions[journeyPlaceCandidateKey(candidate)];
    return resolution ? [spotId(candidate, resolution.selected.id)] : [];
  });
}

export type MaterializedJourneySpot = ReviewAtlasSpot;
