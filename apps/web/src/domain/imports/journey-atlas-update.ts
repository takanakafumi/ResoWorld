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
  missedVisitCandidates: z.array(z.object({
    id: z.string().min(1), name: z.string().min(1), latitude: z.number(), longitude: z.number(),
    claimIds: z.array(z.string().min(1)).min(1), targetKind: z.literal("missed_visit"), positionStatus: z.literal("candidate"),
  })).default([]),
});

export type JourneyAtlasUpdateDraft = z.infer<typeof JourneyAtlasUpdateDraftSchema>;

function documentIdentity(documentIds: string[]) {
  return [...new Set(documentIds)].sort().join("\u0000");
}

function journeyIndexForDraft(atlas: ReviewAtlas, draft: JourneyAtlasUpdateDraft) {
  const journeys = atlas.journeys ?? [];
  const exactIndex = journeys.findIndex(({ id }) => id === draft.journey.id);
  if (exactIndex >= 0) return exactIndex;

  const identity = documentIdentity(draft.journey.documentIds);
  if (!identity) return -1;
  const matchingIndexes = journeys.flatMap((journey, index) =>
    documentIdentity(journey.documentIds) === identity ? [index] : [],
  );
  if (matchingIndexes.length > 1) {
    throw new Error("Multiple existing Journeys have the same document identity.");
  }
  return matchingIndexes[0] ?? -1;
}

export function consolidateJourneysByDocumentIdentity(atlas: ReviewAtlas): ReviewAtlas {
  const journeys = atlas.journeys ?? [];
  const groups = new Map<string, typeof journeys>();
  const order: string[] = [];
  for (const journey of journeys) {
    const identity = documentIdentity(journey.documentIds) || `id:${journey.id}`;
    const group = groups.get(identity);
    if (group) group.push(journey);
    else {
      groups.set(identity, [journey]);
      order.push(identity);
    }
  }

  return {
    ...atlas,
    journeys: order.map((identity) => {
      const group = groups.get(identity)!;
      const first = group[0];
      const latest = group[group.length - 1];
      const unvisitedPlaces = [...new Map(group.flatMap(({ unvisitedPlaces }) => unvisitedPlaces ?? []).map((place) => [place.id, place])).values()];
      return {
        ...first,
        label: latest.label,
        documentIds: [...new Set(group.flatMap(({ documentIds }) => documentIds))],
        spotIds: [...new Set(group.flatMap(({ spotIds }) => spotIds))],
        connectionIds: [...new Set(group.flatMap(({ connectionIds }) => connectionIds))],
        ...(unvisitedPlaces.length > 0 ? { unvisitedPlaces } : {}),
      };
    }),
  };
}

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
  const place = review.places.find(({ key }) => key === placeKey);
  const name = place?.name ?? "";
  if (/博物館|資料館|歴史館|体験学習館/.test(name)) return "博物館・歴史資料館";
  if (/歴史公園/.test(name)) return "遺跡・歴史公園";
  if (/遺跡|古墳|墳墓|王墓/.test(name)) return "遺跡・古墳";
  if (/神社|大社|神宮/.test(name)) return "神社";
  if (/寺|院/.test(name)) return "寺院";
  if (/温泉|の湯|銭湯/.test(name)) return "温泉・入浴施設";
  const selection = place?.positionCandidate?.selected;
  if (selection?.type === "administrative") return "地域（行政区域）";
  if (selection?.type === "peak") return "山・地形";
  return selection?.type || selection?.category || "種別要確認";
}

export function buildJourneyAtlasUpdateDraft(
  review: JourneyPlaceReviewDraft,
  existingSpots: ReviewAtlasSpot[],
): JourneyAtlasUpdateDraft {
  const unsupportedVisit = review.places.find(({ classification, claimIds }) =>
    classification === "visited" && claimIds.length === 0,
  );
  if (unsupportedVisit) throw new Error(`Visited place needs a supporting Claim: ${unsupportedVisit.name}`);
  const unresolvedMissedVisit = review.places.find(({ classification, positionCandidate }) => classification === "wanted_unvisited" && !positionCandidate);
  if (unresolvedMissedVisit) throw new Error(`Wanted-unvisited place needs a position candidate: ${unresolvedMissedVisit.name}`);
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
    missedVisitCandidates: review.places
      .filter(({ classification }) => classification === "wanted_unvisited")
      .map(({ key, name, claimIds, positionCandidate }) => ({
        id: `unvisited-${stableHash(key)}`, name,
        latitude: positionCandidate!.selected.latitude, longitude: positionCandidate!.selected.longitude,
        claimIds, targetKind: "missed_visit" as const, positionStatus: "candidate" as const,
      })),
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
  const journeyIndex = journeyIndexForDraft(atlas, draft);
  if (journeyIndex >= 0) {
    const current = journeys[journeyIndex];
    journeys[journeyIndex] = {
      ...current,
      label: draft.journey.label,
      documentIds: [...new Set([...current.documentIds, ...draft.journey.documentIds])],
      spotIds: [...new Set([...current.spotIds, ...journeySpotIds])],
      unvisitedPlaces: [...new Map([...(current.unvisitedPlaces ?? []), ...draft.missedVisitCandidates].map((place) => [place.id, place])).values()],
    };
  } else {
    journeys.push({ id: draft.journey.id, label: draft.journey.label, documentIds: draft.journey.documentIds, spotIds: journeySpotIds, connectionIds: [], unvisitedPlaces: draft.missedVisitCandidates });
  }
  return { ...atlas, spots, journeys };
}
