import { asakuraConnectionsPack } from "@/domain/lens-packs/asakura-pack";
import { hagiBakumatsuPack } from "@/domain/lens-packs/bakumatsu-pack";
import { lensEntityNamesMatch } from "@/domain/lens-packs/entity-identity";
import { hyugaMythologyPack } from "@/domain/lens-packs/hyuga-mythology-pack";
import { ishinFiguresPack } from "@/domain/lens-packs/ishin-figures-pack";
import { izumoKunitsukamiPack } from "@/domain/lens-packs/izumo-kunitsukami-pack";
import { registeredLensTopics } from "@/domain/lens-packs/knowledge-registry";
import { marineDeitiesPack } from "@/domain/lens-packs/marine-deities-pack";
import { miyajimaMisenSacredLandscapePack } from "@/domain/lens-packs/miyajima-misen-pack";
import {
  ancientDefenseNetworkPack,
  ancientHighwaysNetworkPack,
  ichinomiyaWesternNetworkPack,
  jinmuToseiNetworkPack,
  shikinaishaChikuzenBuzenPack,
  shokaSonjukuNetworkPack,
  yayoiArchaeologyNetworkPack,
} from "@/domain/lens-packs/pack-loader";
import { projectLensMapPreset } from "@/domain/lens-packs/projection";
import { religionRelationsPack, wajindenRoutesPack } from "@/domain/lens-packs/seed-packs";
import type { ReviewAtlasConnection, ReviewAtlasSpot, ReviewExplorationSuggestion } from "@/domain/review/types";

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

function withLensReferences(
  connections: ReturnType<typeof registeredPresetConnections>,
  lensIds: readonly string[],
) {
  return connections.map((connection) => ({
    ...connection,
    lensRefs: lensIds.map((lensId) => {
      const topic = registeredLensTopics.find((candidate) =>
        candidate.perspectiveId === lensId &&
        candidate.pack.id === connection.packId &&
        candidate.presetId === connection.presetId
      );
      return {
        lensId,
        packId: connection.packId,
        presetId: connection.presetId,
        ...(topic ? { topicId: topic.id, topicLabel: topic.label } : {}),
      };
    }),
  }));
}
const knowledgeMapRegistrations = [
  { lensIds: ["people"], pack: ishinFiguresPack, presetId: "ishin-network" },
  { lensIds: ["people"], pack: hagiBakumatsuPack, presetId: "bakumatsu-structure", connectionIds: ["hagi-education-geography"] },
  { lensIds: ["politics"], pack: hagiBakumatsuPack, presetId: "bakumatsu-structure" },
  { lensIds: ["route"], pack: wajindenRoutesPack, presetId: "wajinden-comparison" },
  { lensIds: ["route"], pack: asakuraConnectionsPack, presetId: "asakura-yamatai-context" },
  { lensIds: ["route"], pack: miyajimaMisenSacredLandscapePack, presetId: "miyajima-current-paths" },
  { lensIds: ["religion"], pack: religionRelationsPack, presetId: "local-shrine-connections" },
  { lensIds: ["religion"], pack: miyajimaMisenSacredLandscapePack, presetId: "miyajima-sacred-relations" },
  { lensIds: ["religion"], pack: shikinaishaChikuzenBuzenPack, presetId: "shikinaisha-network-preset" },
  { lensIds: ["politics"], pack: ancientDefenseNetworkPack, presetId: "dazaifu-defense-preset" },
  { lensIds: ["religion"], pack: ichinomiyaWesternNetworkPack, presetId: "ichinomiya-western-preset" },
  { lensIds: ["people"], pack: shokaSonjukuNetworkPack, presetId: "shoka-sonjuku-action-preset" },
  { lensIds: ["route"], pack: ancientHighwaysNetworkPack, presetId: "ancient-highways-preset" },
  { lensIds: ["route"], pack: yayoiArchaeologyNetworkPack, presetId: "yayoi-archaeology-preset" },
  { lensIds: ["route"], pack: jinmuToseiNetworkPack, presetId: "jinmu-setouchi-route-preset" },
  { lensIds: ["mythology", "politics"], pack: jinmuToseiNetworkPack, presetId: "jinmu-yamato-conquest-preset" },
  { lensIds: ["mythology"], pack: marineDeitiesPack, presetId: "marine-deities-preset" },
  { lensIds: ["mythology"], pack: hyugaMythologyPack, presetId: "hyuga-mythology-preset" },
  { lensIds: ["mythology"], pack: izumoKunitsukamiPack, presetId: "izumo-kunitsukami-preset" },
] as const;

export const registeredKnowledgeMapConnections = [...new Map(
  knowledgeMapRegistrations.flatMap(
    ({ pack, presetId, ...registration }) => withLensReferences(
      registeredPresetConnections(pack, presetId, "connectionIds" in registration ? registration.connectionIds : undefined),
      registration.lensIds,
    ),
  ).map((connection) => [`${connection.packId}:${connection.presetId}:${connection.id}`, connection]),
).values()];

function placeMatchesSpot(
  place: ReturnType<typeof registeredPresetConnections>[number]["places"][number],
  spot: ReviewAtlasSpot,
) {
  const names = [place.label, ...(place.aliases ?? [])];
  if (names.some((name) => lensEntityNamesMatch(name, spot.name))) {
    return true;
  }
  const coordinates = place.coordinates;
  if (!coordinates) return false;
  return (
    Math.abs(coordinates.latitude - spot.latitude) <= 0.005 &&
    Math.abs(coordinates.longitude - spot.longitude) <= 0.005
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
    .flatMap(({ pack, presetId, ...registration }) => withLensReferences(
      registeredPresetConnections(pack, presetId, "connectionIds" in registration ? registration.connectionIds : undefined),
      registration.lensIds,
    ));
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
  connectionSummary: string;
  anchorSpotIds: string[];
  claimIds: string[];
  relationFamilies: string[];
  reviewStatus: "reviewed" | "draft";
  targetKind: "knowledge_unvisited" | "missed_visit";
  lensId?: string;
  topicId?: string;
  question?: string;
  reason?: string;
};

export function knowledgeVisitFrontiersForVisitedSpots(
  spots: ReviewAtlasSpot[],
  options: { includeUnanchored?: boolean } = {},
): KnowledgeVisitFrontier[] {
  const frontiers = registeredKnowledgeMapConnections.flatMap((connection) => {
    const anchorSpotIds = spots.filter((spot) => connection.places.some((place) => placeMatchesSpot(place, spot))).map(({ id }) => id);
    if (anchorSpotIds.length === 0 && !options.includeUnanchored) return [];
    const lensId = connection.lensRefs?.[0]?.lensId;
    const topicId = connection.lensRefs?.[0]?.topicId ?? connection.presetId;
    return connection.places.flatMap((place) => {
      if (spots.some((spot) => placeMatchesSpot(place, spot))) return [];
      if (!place.coordinates) return [];
      const enrichedQuestion = connection.explorationQuestions?.[place.id];
      return [{
        placeId: place.id,
        label: place.label,
        latitude: place.coordinates.latitude,
        longitude: place.coordinates.longitude,
        connectionId: connection.id,
        connectionTitle: connection.title,
        connectionSummary: connection.description,
        anchorSpotIds,
        claimIds: [...new Set(spots.filter(({ id }) => anchorSpotIds.includes(id)).flatMap(({ claimIds }) => claimIds))],
        relationFamilies: [...connection.relationFamilies],
        reviewStatus: connection.reviewStatus,
        targetKind: "knowledge_unvisited" as const,
        lensId,
        topicId,
        question: enrichedQuestion?.question,
        reason: enrichedQuestion?.reason ?? place.description ?? connection.description,
      }];
    });
  });
  return [...new Map(frontiers.map((frontier) => [`${frontier.connectionId}:${frontier.placeId}`, frontier])).values()];
}

export function knowledgeVisitFrontierToSuggestion(
  frontier: KnowledgeVisitFrontier,
): ReviewExplorationSuggestion {
  return {
    id: `frontier:${frontier.connectionId}:${frontier.placeId}`,
    title: frontier.connectionTitle,
    targetName: frontier.label,
    targetPlaceId: frontier.placeId,
    targetKind: frontier.targetKind,
    actionType: "field_visit",
    latitude: frontier.latitude,
    longitude: frontier.longitude,
    question: frontier.question ?? `${frontier.label}を実際に訪れることで、${frontier.connectionTitle}のどのような痕跡や空間的特徴が確認できるか？`,
    missingInformation: "現地での空間配置・地形の観察、および周辺の関連史跡・遺構の確認",
    reason: frontier.reason ?? frontier.connectionSummary,
    expectedObservation: "文献上の記述と実際の地形・位置関係の整合性",
    uncertainty: "文献と現地の比定に関する異説や時代差",
    claimIds: frontier.claimIds,
    anchorSpotIds: frontier.anchorSpotIds,
    connectionIds: [frontier.connectionId],
    lensId: frontier.lensId,
    topicId: frontier.topicId,
    initialStatus: "suggested",
  };
}

export function knowledgeVisitFrontierSuggestionsForVisitedSpots(
  spots: ReviewAtlasSpot[],
  options?: { includeUnanchored?: boolean },
): ReviewExplorationSuggestion[] {
  return knowledgeVisitFrontiersForVisitedSpots(spots, options).map(knowledgeVisitFrontierToSuggestion);
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
        lensId: registration.lensIds[0],
        topicId: registration.presetId,
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
      lensId: existing.lensId ?? connection.lensId,
      topicId: existing.topicId ?? connection.topicId,
    });
  }
  return [...byId.values()];
}

const knowledgeMapGroups = {
  "wajinden-routes": withLensReferences(
    registeredPresetConnections(
      wajindenRoutesPack,
      "wajinden-comparison",
      ["toma-location-candidates", "wajinden-source-route", "wajinden-kyushu-hypothesis", "wajinden-kinai-hypothesis"],
    ),
    ["route"],
  ),
} as const;

export function knowledgeMapConnectionsForGroup(groupId?: string, spots?: ReviewAtlasSpot[]) {
  const connections = groupId && groupId in knowledgeMapGroups
    ? knowledgeMapGroups[groupId as keyof typeof knowledgeMapGroups]
    : [];
  return spots ? connections.filter((connection) => connectionTouchesSpots(connection, spots)) : connections;
}
