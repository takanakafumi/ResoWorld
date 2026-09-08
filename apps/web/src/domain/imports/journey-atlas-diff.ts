import type { JourneyPlaceReviewDraft } from "./journey-place-review";
import type { ReviewAtlasSpot } from "@/domain/review/types";

function normalizedName(value: string) {
  return value.normalize("NFKC").trim().toLocaleLowerCase("ja");
}

export type JourneyAtlasDiff = {
  reused: { placeKey: string; spot: ReviewAtlasSpot }[];
  additions: { placeKey: string; name: string; latitude: number; longitude: number; claimIds: string[] }[];
  unresolved: { placeKey: string; name: string; reason: "missing_position" | "ambiguous_existing_match" }[];
  ignoredCount: number;
};

export function buildJourneyAtlasDiff(
  draft: JourneyPlaceReviewDraft,
  existingSpots: ReviewAtlasSpot[],
): JourneyAtlasDiff {
  const reused: JourneyAtlasDiff["reused"] = [];
  const additions: JourneyAtlasDiff["additions"] = [];
  const unresolved: JourneyAtlasDiff["unresolved"] = [];
  let ignoredCount = 0;
  for (const place of draft.places) {
    if (place.classification !== "visited") {
      ignoredCount += 1;
      continue;
    }
    const matches = existingSpots.filter((spot) =>
      (place.entityId && place.entityId === spot.id) || normalizedName(place.name) === normalizedName(spot.name),
    );
    if (matches.length === 1) {
      reused.push({ placeKey: place.key, spot: matches[0] });
      continue;
    }
    if (matches.length > 1) {
      unresolved.push({ placeKey: place.key, name: place.name, reason: "ambiguous_existing_match" });
      continue;
    }
    if (!place.positionCandidate) {
      unresolved.push({ placeKey: place.key, name: place.name, reason: "missing_position" });
      continue;
    }
    additions.push({
      placeKey: place.key,
      name: place.name,
      latitude: place.positionCandidate.selected.latitude,
      longitude: place.positionCandidate.selected.longitude,
      claimIds: place.claimIds,
    });
  }
  return { reused, additions, unresolved, ignoredCount };
}
