import type { LensMapConnectionProjection } from "@/domain/lens-packs/projection";
import { lensEntityNamesMatch, normalizeLensEntityName } from "@/domain/lens-packs/entity-identity";
import type {
  ReviewAtlasConnection,
  ReviewAtlasSpot,
  ReviewExplorationSuggestion,
} from "@/domain/review/types";

export type MapConnectionProjection = {
  id: string;
  sourceId: string;
  title: string;
  summary: string;
  origin: "exploration" | "knowledge-pack" | "suggestion";
  selected: boolean;
  points: Array<{
    id: string;
    label: string;
    latitude: number;
    longitude: number;
    kind: "visited" | "reference" | "suggested";
    focusEntityId?: string;
  }>;
  layerLabel?: string;
  claimIds: string[];
  assertionIds: string[];
  sourceIds: string[];
  confidences: string[];
  reviewStatus: "derived" | "draft" | "reviewed";
  appearance?: {
    color: string;
    dashArray?: [number, number];
    legendLabel?: string;
  };
};

export function referencePointOverlapsVisitedSpot(
  point: MapConnectionProjection["points"][number],
  spots: ReviewAtlasSpot[],
) {
  if (point.kind !== "reference") return false;

  return spots.some((spot) => (
    lensEntityNamesMatch(point.label, spot.name) || (
      Math.abs(point.latitude - spot.latitude) <= 0.000001 &&
      Math.abs(point.longitude - spot.longitude) <= 0.000001
    )
  ));
}

export function mapReferencePointKey(point: MapConnectionProjection["points"][number]) {
  return `${normalizeLensEntityName(point.label)}:${point.latitude.toFixed(5)}:${point.longitude.toFixed(5)}`;
}

export type MapReferenceMarkerProjection = {
  id: string;
  point: MapConnectionProjection["points"][number];
  connections: MapConnectionProjection[];
};

export function projectMapReferenceMarkers(
  connections: MapConnectionProjection[],
  spots: ReviewAtlasSpot[],
): MapReferenceMarkerProjection[] {
  const groups = new Map<string, MapReferenceMarkerProjection>();

  for (const connection of connections) {
    for (const point of connection.points) {
      if (point.kind !== "reference" || referencePointOverlapsVisitedSpot(point, spots)) continue;
      const id = mapReferencePointKey(point);
      const group = groups.get(id);
      if (group) {
        if (!group.connections.some((candidate) => candidate.id === connection.id)) {
          group.connections.push(connection);
        }
      } else {
        groups.set(id, { id, point, connections: [connection] });
      }
    }
  }

  return [...groups.values()];
}

function visitedPoint(spot: ReviewAtlasSpot) {
  return {
    id: spot.id,
    label: spot.name,
    latitude: spot.latitude,
    longitude: spot.longitude,
    kind: "visited" as const,
  };
}

export function projectReviewMapConnections({
  connections,
  spots,
  selectedConnectionId,
  selectedEraId,
}: {
  connections: ReviewAtlasConnection[];
  spots: ReviewAtlasSpot[];
  selectedConnectionId: string;
  selectedEraId: string;
}): MapConnectionProjection[] {
  const spotById = new Map(spots.map((spot) => [spot.id, spot]));

  return connections.flatMap((connection) => {
    const selected = connection.id === selectedConnectionId;
    const selectedEra = selected
      ? connection.eras.find((era) => era.id === selectedEraId) ?? connection.eras[0]
      : undefined;
    const pointIds = selectedEra?.spotIds ?? connection.spotIds;
    const points = pointIds.flatMap((id) => {
      const spot = spotById.get(id);
      return spot ? [visitedPoint(spot)] : [];
    });
    if (points.length < 2) return [];

    return [{
      id: `exploration:${connection.id}`,
      sourceId: connection.id,
      title: connection.title,
      summary: connection.summary,
      origin: "exploration" as const,
      selected,
      points,
      layerLabel: selectedEra?.label,
      claimIds: selectedEra?.claimIds ?? connection.claimIds,
      assertionIds: [],
      sourceIds: [],
      confidences: ["not-rated"],
      reviewStatus: connection.initialStatus === "confirmed" ? "reviewed" as const : "draft" as const,
    }];
  });
}

export function projectKnowledgeMapConnections(
  connections: LensMapConnectionProjection[],
  {
    selectedConnectionId = "",
    selectedEntityId = "",
  }: { selectedConnectionId?: string; selectedEntityId?: string } = {},
): MapConnectionProjection[] {
  return connections.flatMap((connection) => {
    const points = connection.places.flatMap((place) => place.coordinates ? [{
      id: place.id,
      label: place.label,
      latitude: place.coordinates.latitude,
      longitude: place.coordinates.longitude,
      kind: "reference" as const,
      focusEntityId: connection.pointFocusEntityIds[place.id],
    }] : []);
    if (points.length < 2) return [];

    return [{
      id: `knowledge-pack:${connection.packId}:${connection.presetId}:${connection.id}`,
      sourceId: connection.id,
      title: connection.title,
      summary: connection.description,
      origin: connection.origin,
      selected: connection.id === selectedConnectionId || (
        Boolean(selectedEntityId) && (
          connection.anchor?.id === selectedEntityId ||
          connection.contextEntities.some((entity) => entity.id === selectedEntityId) ||
          Object.values(connection.pointFocusEntityIds).includes(selectedEntityId)
        )
      ),
      points,
      claimIds: [],
      assertionIds: connection.assertions.map((assertion) => assertion.id),
      sourceIds: connection.sources.map((source) => source.id),
      confidences: connection.confidences,
      reviewStatus: connection.reviewStatus,
      appearance: connection.appearance,
    }];
  });
}

export function projectSuggestionMapConnection(
  suggestion: ReviewExplorationSuggestion,
  spots: ReviewAtlasSpot[],
): MapConnectionProjection | undefined {
  const spotById = new Map(spots.map((spot) => [spot.id, spot]));
  const points: MapConnectionProjection["points"] = suggestion.anchorSpotIds.flatMap((id) => {
    const spot = spotById.get(id);
    return spot ? [visitedPoint(spot)] : [];
  });
  points.push({
    id: suggestion.id,
    label: suggestion.targetName,
    latitude: suggestion.latitude,
    longitude: suggestion.longitude,
    kind: "suggested",
  });
  if (points.length < 2) return undefined;

  return {
    id: `suggestion:${suggestion.id}`,
    sourceId: suggestion.id,
    title: suggestion.title,
    summary: suggestion.reason,
    origin: "suggestion",
    selected: true,
    points,
    claimIds: suggestion.claimIds,
    assertionIds: [],
    sourceIds: [],
    confidences: ["not-rated"],
    reviewStatus: "derived",
  };
}
