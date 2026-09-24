import type { ReviewAtlasSpot } from "./types";

export function orderSpotsByJourney(
  spots: ReviewAtlasSpot[],
  journeySpotIds: string[],
) {
  const spotById = new Map(spots.map((spot) => [spot.id, spot]));
  return journeySpotIds.flatMap((spotId) => {
    const spot = spotById.get(spotId);
    return spot ? [spot] : [];
  });
}
