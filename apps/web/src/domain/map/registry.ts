import { hagiBakumatsuPack } from "@/domain/lens-packs/bakumatsu-pack";
import { lensEntityNamesMatch } from "@/domain/lens-packs/entity-identity";
import { ishinFiguresPack } from "@/domain/lens-packs/ishin-figures-pack";
import { projectLensMapPreset } from "@/domain/lens-packs/projection";
import { religionRelationsPack, wajindenRoutesPack } from "@/domain/lens-packs/seed-packs";
import type { ReviewAtlasConnection, ReviewAtlasSpot } from "@/domain/review/types";

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

export type KnowledgeVisitFrontier = {
  placeId: string;
  label: string;
  latitude: number;
  longitude: number;
  connectionId: string;
  connectionTitle: string;
  anchorSpotIds: string[];
  claimIds: string[];
  relationFamilies: string[];
  reviewStatus: "reviewed" | "draft";
  targetKind: "knowledge_unvisited" | "missed_visit";
};

export function knowledgeVisitFrontiersForVisitedSpots(spots: ReviewAtlasSpot[]): KnowledgeVisitFrontier[] {
  const frontiers = registeredKnowledgeMapConnections.flatMap((connection) => {
    const anchorSpotIds = spots.filter((spot) => connection.places.some((place) => placeMatchesSpot(place, spot))).map(({ id }) => id);
    if (anchorSpotIds.length === 0) return [];
    return connection.places.flatMap((place) => {
      if (spots.some((spot) => placeMatchesSpot(place, spot))) return [];
      if (!place.coordinates) return [];
      return [{
        placeId: place.id,
        label: place.label,
        latitude: place.coordinates.latitude,
        longitude: place.coordinates.longitude,
        connectionId: connection.id,
        connectionTitle: connection.title,
        anchorSpotIds,
        claimIds: [...new Set(spots.filter(({ id }) => anchorSpotIds.includes(id)).flatMap(({ claimIds }) => claimIds))],
        relationFamilies: [...connection.relationFamilies],
        reviewStatus: connection.reviewStatus,
        targetKind: "knowledge_unvisited" as const,
      }];
    });
  });
  return [...new Map(frontiers.map((frontier) => [`${frontier.connectionId}:${frontier.placeId}`, frontier])).values()];
}

const lensLabels: Record<string, string> = { people: "人物", politics: "政治・社会", route: "ルート", religion: "宗教" };

export function knowledgeSuggestionConnectionsForVisitedSpots(spots: ReviewAtlasSpot[]): ReviewAtlasConnection[] {
  const projected = knowledgeMapRegistrations.flatMap((registration) => (
    registeredPresetConnections(
      registration.pack,
      registration.presetId,
      "connectionIds" in registration ? registration.connectionIds : undefined,
    ).filter((connection) => (
      connection.places.length >= 2 && connection.places.every((place) => spots.some((spot) => placeMatchesSpot(place, spot)))
    )).map((connection) => {
      const matchedSpots = spots.filter((spot) => connection.places.some((place) => placeMatchesSpot(place, spot)));
      const isComparative = connection.relationFamilies.includes("conceptual-comparison");
      return {
        id: connection.id,
        connectionKind: isComparative ? "comparative" as const : "documented" as const,
        initialStatus: connection.reviewStatus === "reviewed" ? "confirmed" as const : "suggested" as const,
        eyebrow: "KNOWLEDGE PACK",
        title: connection.title,
        summary: connection.description,
        spotIds: matchedSpots.map(({ id }) => id),
        claimIds: [...new Set(matchedSpots.flatMap((spot) => spot.claimIds))],
        concepts: [...new Set([...connection.contextEntities, ...connection.places].map(({ label }) => label))],
        facets: registration.lensIds.map((id) => ({ id, label: lensLabels[id] ?? id, weight: 5 })),
        eras: [],
      };
    })
  ));
  const byId = new Map<string, ReviewAtlasConnection>();
  for (const connection of projected) {
    const existing = byId.get(connection.id);
    if (!existing) {
      byId.set(connection.id, connection);
      continue;
    }
    byId.set(connection.id, {
      ...existing,
      spotIds: [...new Set([...existing.spotIds, ...connection.spotIds])],
      claimIds: [...new Set([...existing.claimIds, ...connection.claimIds])],
      concepts: [...new Set([...existing.concepts, ...connection.concepts])],
      facets: [...new Map([...existing.facets, ...connection.facets].map((facet) => [facet.id, facet])).values()],
    });
  }
  return [...byId.values()];
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
