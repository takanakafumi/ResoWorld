import { z } from "zod";

import type { JourneyPlaceReviewDraft } from "./journey-place-review";
import { buildJourneyAtlasDiff } from "./journey-atlas-diff";
import type { ReviewAtlas, ReviewAtlasSpot } from "@/domain/review/types";

const CandidateSpotSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  region: z.string().min(1),
  kind: z.string().min(1),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  claimIds: z.array(z.string().min(1)),
  positionStatus: z.literal("candidate"),
});

export const JourneyAtlasUpdateDraftSchema = z.object({
  schemaVersion: z.literal("0.1.0"),
  status: z.literal("atlas_update_candidate"),
  journey: z.object({
    id: z.string().min(1),
    label: z.string().min(1),
    documentIds: z.array(z.string().min(1)),
    reusedSpotUpdates: z.array(z.object({
      spotId: z.string().min(1),
      addedClaimIds: z.array(z.string().min(1)),
    })),
    candidateSpotIds: z.array(z.string().min(1)),
  }),
  candidateSpots: z.array(CandidateSpotSchema),
  historicalCandidates: z.array(z.object({
    key: z.string().min(1),
    name: z.string().min(1),
    claimIds: z.array(z.string().min(1)),
  })),
});

export type JourneyAtlasUpdateDraft = z.infer<typeof JourneyAtlasUpdateDraftSchema>;

function stableHash(value: string) {
  let hash = 2166136261;
  for (const character of value.normalize("NFKC")) {
    hash ^= character.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function inferredRegion(review: JourneyPlaceReviewDraft, placeKey: string) {
  const selection = review.places.find(({ key }) => key === placeKey)?.positionCandidate?.selected;
  const address = selection?.address ?? {};
  return address.state ?? address.province ?? address.county ?? address.city ?? address.town ?? address.village ?? "地域要確認";
}

function inferredKind(review: JourneyPlaceReviewDraft, placeKey: string) {
  const selection = review.places.find(({ key }) => key === placeKey)?.positionCandidate?.selected;
  if (selection?.type === "administrative") return "地域（行政区域）";
  if (selection?.type === "peak") return "山・地形";
  return selection?.type || selection?.category || "種別要確認";
}

export function buildJourneyAtlasUpdateDraft(
  review: JourneyPlaceReviewDraft,
  existingSpots: ReviewAtlasSpot[],
): JourneyAtlasUpdateDraft {
  const diff = buildJourneyAtlasDiff(review, existingSpots);
  if (diff.unresolved.length > 0) throw new Error("All visited places must be resolved before creating an Atlas update draft.");
  const existingIds = new Set(existingSpots.map(({ id }) => id));
  const candidateSpots = diff.additions.map((place) => {
    const baseId = `spot-import-${stableHash(place.placeKey)}`;
    if (existingIds.has(baseId)) throw new Error("Generated candidate Spot ID conflicts with the existing Atlas.");
    return {
      id: baseId,
      name: place.name,
      region: inferredRegion(review, place.placeKey),
      kind: inferredKind(review, place.placeKey),
      latitude: place.latitude,
      longitude: place.longitude,
      claimIds: place.claimIds,
      positionStatus: "candidate" as const,
    };
  });
  return JourneyAtlasUpdateDraftSchema.parse({
    schemaVersion: "0.1.0",
    status: "atlas_update_candidate",
    journey: {
      id: review.journey.id,
      label: review.journey.label,
      documentIds: review.documentIds,
      reusedSpotUpdates: diff.reused.map(({ placeKey, spot }) => ({
        spotId: spot.id,
        addedClaimIds: review.places.find(({ key }) => key === placeKey)?.claimIds ?? [],
      })),
      candidateSpotIds: candidateSpots.map(({ id }) => id),
    },
    candidateSpots,
    historicalCandidates: review.places
      .filter(({ classification }) => classification === "historical_candidate")
      .map(({ key, name, claimIds }) => ({ key, name, claimIds })),
  });
}

export function applyJourneyAtlasUpdateDraft(
  atlas: ReviewAtlas,
  draft: JourneyAtlasUpdateDraft,
): ReviewAtlas {
  const updates = new Map(draft.journey.reusedSpotUpdates.map((update) => [update.spotId, update]));
  const spots = atlas.spots.map((spot) => {
    const update = updates.get(spot.id);
    return update ? { ...spot, claimIds: [...new Set([...spot.claimIds, ...update.addedClaimIds])] } : spot;
  });
  const knownSpotIds = new Set(spots.map(({ id }) => id));
  for (const spot of draft.candidateSpots) {
    if (knownSpotIds.has(spot.id)) throw new Error("Candidate Spot ID already exists in the Atlas.");
    knownSpotIds.add(spot.id);
    spots.push(spot);
  }
  const journeySpotIds = [
    ...draft.journey.reusedSpotUpdates.map(({ spotId }) => spotId),
    ...draft.journey.candidateSpotIds,
  ];
  const journeys = [...(atlas.journeys ?? [])];
  const journeyIndex = journeys.findIndex(({ id }) => id === draft.journey.id);
  if (journeyIndex >= 0) {
    const current = journeys[journeyIndex];
    journeys[journeyIndex] = {
      ...current,
      label: draft.journey.label,
      documentIds: [...new Set([...current.documentIds, ...draft.journey.documentIds])],
      spotIds: [...new Set([...current.spotIds, ...journeySpotIds])],
    };
  } else {
    journeys.push({ id: draft.journey.id, label: draft.journey.label, documentIds: draft.journey.documentIds, spotIds: journeySpotIds, connectionIds: [] });
  }
  return { ...atlas, spots, journeys };
}
