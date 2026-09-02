import type { LensMapConnectionProjection } from "@/domain/lens-packs/projection";
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
  }>;
  layerLabel?: string;
  claimIds: string[];
  assertionIds: string[];
  sourceIds: string[];
  confidences: string[];
  reviewStatus: "derived" | "draft" | "reviewed";
};

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
      reviewStatus: "derived" as const,
    }];
  });
}

export function projectKnowledgeMapConnections(
  connections: LensMapConnectionProjection[],
  selectedConnectionId = "",
): MapConnectionProjection[] {
  return connections.flatMap((connection) => {
    const points = connection.places.flatMap((place) => place.coordinates ? [{
      id: place.id,
      label: place.label,
      latitude: place.coordinates.latitude,
      longitude: place.coordinates.longitude,
      kind: "reference" as const,
    }] : []);
    if (points.length < 2) return [];

    return [{
      id: `knowledge-pack:${connection.packId}:${connection.presetId}:${connection.id}`,
      sourceId: connection.id,
      title: connection.title,
      summary: connection.description,
      origin: connection.origin,
      selected: connection.id === selectedConnectionId,
      points,
      claimIds: [],
      assertionIds: connection.assertions.map((assertion) => assertion.id),
      sourceIds: connection.sources.map((source) => source.id),
      confidences: connection.confidences,
      reviewStatus: connection.reviewStatus,
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
