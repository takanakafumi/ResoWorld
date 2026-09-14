import type { ReviewAtlasSpot, ReviewDataset } from "@/domain/review/types";

import { lensEntityNamesMatch } from "./entity-identity";

export type LensExplorationLink = {
  claimIds: string[];
  spotIds: string[];
  observedSpotIds: string[];
};

export function hasLensExplorationContext(links: Map<string, LensExplorationLink>) {
  return [...links.values()].some((link) => link.claimIds.length > 0 || link.spotIds.length > 0);
}

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

export type LensEntityIdentity = {
  id: string;
  label: string;
  aliases: string[];
};

export function buildLensExplorationLinksByIdentity(
  claims: ReviewDataset["claims"],
  spots: ReviewAtlasSpot[],
  entities: LensEntityIdentity[],
  options: { entryOnly?: boolean } = {},
) {
  const links = options.entryOnly
    ? new Map<string, LensExplorationLink>()
    : buildLensExplorationLinks(claims, spots, entities.map((entity) => entity.id));
  const spotsByClaimId = new Map<string, string[]>();
  const spotsById = new Map(spots.map((spot) => [spot.id, spot]));
  for (const spot of spots) {
    for (const claimId of spot.claimIds) {
      spotsByClaimId.set(claimId, [...(spotsByClaimId.get(claimId) ?? []), spot.id]);
    }
  }

  for (const claim of claims) {
    const references = options.entryOnly
      ? [
          claim.subject,
          ...claim.places
            .filter((place) => place.role === "observed_place" || place.role === "subject_place")
            .map((place) => ({ id: place.entityId, name: place.name, type: "Place" as const })),
        ]
      : [
          claim.subject,
          ...(claim.object.kind === "entity" ? [claim.object.entity] : []),
          ...claim.places.map((place) => ({ id: place.entityId, name: place.name, type: "Place" as const })),
        ];
    for (const entity of entities) {
      const names = [entity.label, ...entity.aliases];
      if (!references.some((reference) =>
        reference.id === entity.id || names.some((name) => lensEntityNamesMatch(reference.name, name)),
      )) continue;
      const current = links.get(entity.id) ?? { claimIds: [], spotIds: [], observedSpotIds: [] };
      if (!current.claimIds.includes(claim.id)) current.claimIds.push(claim.id);
      const relatedSpotIds = (spotsByClaimId.get(claim.id) ?? []).filter((spotId) => {
        if (!options.entryOnly) return true;
        const spot = spotsById.get(spotId);
        return Boolean(spot && names.some((name) => lensEntityNamesMatch(spot.name, name)));
      });
      for (const spotId of relatedSpotIds) {
        if (!current.spotIds.includes(spotId)) current.spotIds.push(spotId);
      }
      const observed = claim.places.some((place) => place.role === "observed_place" && names.some((name) => lensEntityNamesMatch(place.name, name)));
      if (observed) {
        for (const spotId of relatedSpotIds) {
          if (!current.observedSpotIds.includes(spotId)) current.observedSpotIds.push(spotId);
        }
      }
      links.set(entity.id, current);
    }
  }
  if (options.entryOnly) {
    for (const spot of spots) {
      for (const entity of entities) {
        if (![entity.label, ...entity.aliases].some((name) => lensEntityNamesMatch(spot.name, name))) continue;
        const current = links.get(entity.id) ?? { claimIds: [], spotIds: [], observedSpotIds: [] };
        if (!current.spotIds.includes(spot.id)) current.spotIds.push(spot.id);
        if (!current.observedSpotIds.includes(spot.id)) current.observedSpotIds.push(spot.id);
        links.set(entity.id, current);
      }
    }
  }
  return links;
}
