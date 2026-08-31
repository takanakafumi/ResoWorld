import type { ReviewAtlasSpot, ReviewDataset } from "@/domain/review/types";

export type LensExplorationLink = {
  claimIds: string[];
  spotIds: string[];
  observedSpotIds: string[];
};

export function buildLensExplorationLinks(
  claims: ReviewDataset["claims"],
  spots: ReviewAtlasSpot[],
  visibleEntityIds: Iterable<string>,
) {
  const visibleIds = new Set(visibleEntityIds);
  const spotsByClaimId = new Map<string, string[]>();
  for (const spot of spots) {
    for (const claimId of spot.claimIds) {
      spotsByClaimId.set(claimId, [...(spotsByClaimId.get(claimId) ?? []), spot.id]);
    }
  }

  const links = new Map<string, LensExplorationLink>();
  for (const claim of claims) {
    const observedEntityIds = new Set(claim.places.filter((place) => place.role === "observed_place").map((place) => place.entityId).filter((id): id is string => Boolean(id)));
    const entityIds = new Set([
      claim.subject.id,
      claim.object.kind === "entity" ? claim.object.entity.id : undefined,
      ...claim.places.map((place) => place.entityId),
    ].filter((id): id is string => Boolean(id && visibleIds.has(id))));

    for (const entityId of entityIds) {
      const current = links.get(entityId) ?? { claimIds: [], spotIds: [], observedSpotIds: [] };
      if (!current.claimIds.includes(claim.id)) current.claimIds.push(claim.id);
      for (const spotId of spotsByClaimId.get(claim.id) ?? []) {
        if (!current.spotIds.includes(spotId)) current.spotIds.push(spotId);
        if (observedEntityIds.has(entityId) && !current.observedSpotIds.includes(spotId)) current.observedSpotIds.push(spotId);
      }
      links.set(entityId, current);
    }
  }
  return links;
}
