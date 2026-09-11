import { hagiBakumatsuPack } from "@/domain/lens-packs/bakumatsu-pack";
import { lensEntityNamesMatch } from "@/domain/lens-packs/entity-identity";
import { ishinFiguresPack } from "@/domain/lens-packs/ishin-figures-pack";
import { projectLensMapPreset } from "@/domain/lens-packs/projection";
import { religionRelationsPack, wajindenRoutesPack } from "@/domain/lens-packs/seed-packs";
import type { ReviewAtlasSpot } from "@/domain/review/types";

function registeredPresetConnections(
  pack: Parameters<typeof projectLensMapPreset>[0],
  presetId: string,
  connectionIds?: readonly string[],
) {
  const projected = projectLensMapPreset(pack, presetId);
  if (!connectionIds) return projected;
  const selected = new Set(connectionIds);
  return projected.filter((connection) => selected.has(connection.id));
}

const knowledgeMapRegistrations = [
  { lensIds: ["people"], pack: ishinFiguresPack, presetId: "ishin-network" },
  { lensIds: ["people"], pack: hagiBakumatsuPack, presetId: "bakumatsu-structure", connectionIds: ["hagi-education-geography"] },
  { lensIds: ["politics"], pack: hagiBakumatsuPack, presetId: "bakumatsu-structure" },
  { lensIds: ["route"], pack: wajindenRoutesPack, presetId: "wajinden-comparison", connectionIds: ["ito-archaeology-visits", "nakoku-archaeology-visits", "fumi-koshoji-hypothesis"] },
  { lensIds: ["religion"], pack: religionRelationsPack, presetId: "local-shrine-connections" },
] as const;

export const registeredKnowledgeMapConnections = [...new Map(
  knowledgeMapRegistrations.flatMap(
    ({ pack, presetId, ...registration }) => registeredPresetConnections(pack, presetId, "connectionIds" in registration ? registration.connectionIds : undefined),
  ).map((connection) => [`${connection.packId}:${connection.presetId}:${connection.id}`, connection]),
).values()];

function placeMatchesSpot(
  place: ReturnType<typeof registeredPresetConnections>[number]["places"][number],
  spot: ReviewAtlasSpot,
) {
  const coordinates = place.coordinates;
  if (!coordinates) return false;
  return (
    lensEntityNamesMatch(place.label, spot.name) || (
      Math.abs(coordinates.latitude - spot.latitude) <= 0.0005 &&
      Math.abs(coordinates.longitude - spot.longitude) <= 0.0005
    )
  );
}

function connectionTouchesSpots(
  connection: ReturnType<typeof registeredPresetConnections>[number],
  spots: ReviewAtlasSpot[],
) {
  return connection.places.some((place) => spots.some((spot) => placeMatchesSpot(place, spot)));
}

export function knowledgeMapConnectionsForLens(lensId: string, spots?: ReviewAtlasSpot[]) {
  const connections = knowledgeMapRegistrations
    .filter((registration) => registration.lensIds.some((id) => id === lensId))
    .flatMap(({ pack, presetId, ...registration }) => registeredPresetConnections(pack, presetId, "connectionIds" in registration ? registration.connectionIds : undefined));
  return spots ? connections.filter((connection) => connectionTouchesSpots(connection, spots)) : connections;
}

export function knowledgeMapConnectionsForVisitedSpots(spots: ReviewAtlasSpot[]) {
  return registeredKnowledgeMapConnections.filter((connection) => (
    connection.places.length >= 2 && connection.places.every((place) => (
      spots.some((spot) => placeMatchesSpot(place, spot))
    ))
  ));
}

const knowledgeMapGroups = {
  "wajinden-routes": registeredPresetConnections(
    wajindenRoutesPack,
    "wajinden-comparison",
    ["toma-location-candidates", "wajinden-source-route", "wajinden-kyushu-hypothesis", "wajinden-kinai-hypothesis"],
  ),
} as const;

export function knowledgeMapConnectionsForGroup(groupId?: string, spots?: ReviewAtlasSpot[]) {
  const connections = groupId && groupId in knowledgeMapGroups
    ? knowledgeMapGroups[groupId as keyof typeof knowledgeMapGroups]
    : [];
  return spots ? connections.filter((connection) => connectionTouchesSpots(connection, spots)) : connections;
}
