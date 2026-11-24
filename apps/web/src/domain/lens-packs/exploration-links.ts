import type { ReviewAtlasSpot, ReviewDataset } from "@/domain/review/types";

import { lensEntityNamesMatch } from "./entity-identity";
import {
  isConcretePlaceEntityKind,
  spotDistanceKm,
  spotMatchesAreaEntity,
  spotMatchesConcretePlaceEntity,
} from "./entity-visit-state";
import type { LensAreaScope, LensSpatialGranularity } from "./schema";
import { isPlaceLikeKind } from "@/domain/lenses/candidate-matching";

export type LensExplorationLink = {
  claimIds: string[];
  spotIds: string[];
  observedSpotIds: string[];
  primarySpotId?: string;
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
  coordinates?: { latitude: number; longitude: number };
  primarySpotId?: string;
  kind?: string;
  spatialGranularity?: LensSpatialGranularity;
  areaScope?: LensAreaScope;
};

function matchesPlaceEntitySpot(
  entity: LensEntityIdentity,
  spot: ReviewAtlasSpot,
  hasExplicitPrimarySpotInAtlas: boolean,
): boolean {
  if (entity.spatialGranularity === "area") {
    return spotMatchesAreaEntity(entity, spot);
  }
  return spotMatchesConcretePlaceEntity(entity, spot, { hasExplicitPrimarySpotInAtlas });
}

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

  const isSpotWithinRange = (
    spot: ReviewAtlasSpot,
    coords?: { latitude: number; longitude: number },
  ) => {
    if (!coords) return true;
    if (spot.latitude === 0 && spot.longitude === 0) return true;
    return spotDistanceKm(spot, coords) <= 40;
  };

  // 初期IDベースリンクにも物理地点エンティティの同一性ガードを適用し、
  // 他スポット・資料館の Claim 暗黙共起による spotIds / observedSpotIds 汚染を根絶する（原則 ⑭）
  for (const entity of entities) {
    if (!isConcretePlaceEntityKind(entity.kind)) continue;
    const current = links.get(entity.id);
    if (!current) continue;
    const hasExplicitPrimarySpotInAtlas = Boolean(entity.primarySpotId && spotsById.has(entity.primarySpotId));
    current.spotIds = current.spotIds.filter((spotId) => {
      const spot = spotsById.get(spotId);
      return Boolean(spot && matchesPlaceEntitySpot(entity, spot, hasExplicitPrimarySpotInAtlas));
    });
    current.observedSpotIds = current.observedSpotIds.filter((spotId) => {
      const spot = spotsById.get(spotId);
      return Boolean(spot && matchesPlaceEntitySpot(entity, spot, hasExplicitPrimarySpotInAtlas));
    });
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
      const entityCoords = entity.coordinates;
      const isConcretePlace = isConcretePlaceEntityKind(entity.kind);
      const hasExplicitPrimarySpotInAtlas = Boolean(entity.primarySpotId && spotsById.has(entity.primarySpotId));

      if (!references.some((reference) => {
        if (reference.id === entity.id) return true;
        if (!names.some((name) => lensEntityNamesMatch(reference.name, name))) return false;
        if (entityCoords) {
          const claimSpots = (spotsByClaimId.get(claim.id) ?? []).map((id) => spotsById.get(id)).filter((s): s is ReviewAtlasSpot => Boolean(s));
          if (claimSpots.length > 0) {
            const hasNearbySpot = claimSpots.some((s) => isSpotWithinRange(s, entityCoords));
            if (!hasNearbySpot) return false;
          }
        }
        return true;
      })) continue;

      const current = links.get(entity.id) ?? { claimIds: [], spotIds: [], observedSpotIds: [] };
      if (!current.claimIds.includes(claim.id)) current.claimIds.push(claim.id);
      const relatedSpotIds = (spotsByClaimId.get(claim.id) ?? []).filter((spotId) => {
        const spot = spotsById.get(spotId);
        if (!spot) return false;
        if (entity.spatialGranularity !== "area" && !isSpotWithinRange(spot, entityCoords)) return false;
        if (options.entryOnly) {
          return entity.spatialGranularity === "area"
            ? spotMatchesAreaEntity(entity, spot)
            : names.some((name) => lensEntityNamesMatch(spot.name, name));
        }
        if (isConcretePlace) {
          return matchesPlaceEntitySpot(entity, spot, hasExplicitPrimarySpotInAtlas);
        }
        return true;
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
        const hasExplicitPrimarySpotInAtlas = Boolean(entity.primarySpotId && spotsById.has(entity.primarySpotId));
        if (isConcretePlaceEntityKind(entity.kind) && !matchesPlaceEntitySpot(entity, spot, hasExplicitPrimarySpotInAtlas)) continue;
        const current = links.get(entity.id) ?? { claimIds: [], spotIds: [], observedSpotIds: [] };
        if (!current.spotIds.includes(spot.id)) current.spotIds.push(spot.id);
        if (!current.observedSpotIds.includes(spot.id)) current.observedSpotIds.push(spot.id);
        links.set(entity.id, current);
      }
    }
  }

  // Populate primarySpotId and ensure primary spot is ordered first for place entities (or exact label match)
  for (const entity of entities) {
    const current = links.get(entity.id);
    if (!current) continue;
    const isPlace = !("kind" in entity) || isPlaceLikeKind(entity.kind);
    const names = isPlace ? [entity.label, ...entity.aliases] : [entity.label];
    const coords = entity.coordinates;
    const hasExplicitPrimarySpotInAtlas = Boolean(entity.primarySpotId && spotsById.has(entity.primarySpotId));

    // 1. Declarative primarySpotId on entity (when present in Atlas, never fall back to another spot by name)
    const directMatch = hasExplicitPrimarySpotInAtlas
      ? spotsById.get(entity.primarySpotId!)
      : (() => {
          const matches = spots.filter((spot) => names.some((name) => lensEntityNamesMatch(spot.name, name)));
          if (matches.length === 0) return undefined;
          if (coords) {
            const closest = [...matches].sort((a, b) => spotDistanceKm(a, coords) - spotDistanceKm(b, coords))[0];
            return closest && isSpotWithinRange(closest, coords) ? closest : undefined;
          }
          return matches[0];
        })();

    if (directMatch) {
      current.primarySpotId = directMatch.id;
      current.spotIds = [directMatch.id, ...current.spotIds.filter((id) => id !== directMatch.id)];
      if (current.observedSpotIds.includes(directMatch.id)) {
        current.observedSpotIds = [directMatch.id, ...current.observedSpotIds.filter((id) => id !== directMatch.id)];
      }
    }
  }

  return links;
}
