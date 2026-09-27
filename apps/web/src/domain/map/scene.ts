import type { LensMapConnectionProjection } from "@/domain/lens-packs/projection";
import type {
  ReviewAtlasConnection,
  ReviewAtlasSpot,
  ReviewExplorationSuggestion,
} from "@/domain/review/types";

import {
  projectKnowledgeMapConnections,
  projectReviewMapConnections,
  projectSuggestionMapConnection,
} from "./connections";
import type { MapConnectionProjection } from "./connections";
import type { AtlasSelection } from "./selection";

export type MapSceneDiagnostic = {
  code: "insufficient-points" | "missing-evidence" | "duplicate-id";
  connectionId: string;
  message: string;
};

export type MapSceneProjection = {
  connections: MapConnectionProjection[];
  viewportPoints: MapConnectionProjection["points"];
  focusPoint?: MapConnectionProjection["points"][number];
  camera:
    | { mode: "point"; reason: "spot" | "lens-node"; label: string; point: MapConnectionProjection["points"][number] }
    | { mode: "bounds"; reason: "connection" | "suggestion" | "lens" | "journey"; label: string; points: MapConnectionProjection["points"]; maxZoom: number }
    | { mode: "none"; reason: "none"; label: string };
  diagnostics: MapSceneDiagnostic[];
};

export function projectMapScene({
  reviewConnections,
  knowledgeConnections = [],
  selectedSuggestion,
  spots,
  selection,
  viewportKnowledgeConnectionIds = [],
}: {
  reviewConnections: ReviewAtlasConnection[];
  knowledgeConnections?: LensMapConnectionProjection[];
  selectedSuggestion?: ReviewExplorationSuggestion;
  spots: ReviewAtlasSpot[];
  selection: AtlasSelection;
  viewportKnowledgeConnectionIds?: string[];
}): MapSceneProjection {
  const pinnedReview = selection.pinnedConnection?.kind === "exploration"
    ? selection.pinnedConnection
    : undefined;
  const pinnedKnowledgeId = selection.pinnedConnection?.kind === "knowledge" ? selection.pinnedConnection.id : "";
  const focusedReview = selection.focus.kind === "exploration-connection" ? selection.focus : undefined;
  const focusedKnowledgeId = selection.focus.kind === "knowledge-connection" ? selection.focus.id : "";
  const selectedEntityId = selection.focus.kind === "route-node" ? selection.focus.id : "";
  const review = projectReviewMapConnections({
    connections: reviewConnections,
    spots,
    selectedConnectionId: pinnedReview?.id ?? "",
    selectedEraId: pinnedReview?.eraId ?? "",
  });
  const knowledge = projectKnowledgeMapConnections(knowledgeConnections, {
    selectedConnectionId: pinnedKnowledgeId,
    selectedEntityId,
  });
  const suggestion = selectedSuggestion
    ? projectSuggestionMapConnection(selectedSuggestion, spots)
    : undefined;
  const connections = [...review, ...knowledge, ...(suggestion ? [suggestion] : [])];
  const viewportIds = new Set(viewportKnowledgeConnectionIds);
  const requestedViewportConnections = knowledge.filter((connection) => viewportIds.has(connection.sourceId));
  const viewportConnections = selectedEntityId
    ? requestedViewportConnections.filter((connection) => connection.emphasized)
    : requestedViewportConnections;
  const viewportPoints = viewportConnections
    .flatMap((connection) => connection.points)
    .filter((point, index, points) => points.findIndex((candidate) => candidate.id === point.id) === index);
  const lensFocusPoint = selectedEntityId
    ? viewportPoints.find((point) => point.focusEntityId === selectedEntityId)
    : undefined;
  const shouldFocusSelectedSpot = selection.focus.kind === "spot" || (
    selection.focus.kind === "exploration-connection" && selection.focus.focusSpot
  );
  const selectedSpot = shouldFocusSelectedSpot
    ? spots.find((spot) => spot.id === selection.spotId)
    : undefined;
  const focusPoint = lensFocusPoint ?? (selectedSpot ? {
    id: selectedSpot.id,
    label: selectedSpot.name,
    latitude: selectedSpot.latitude,
    longitude: selectedSpot.longitude,
    kind: "visited" as const,
  } : undefined);
  const focusedKnowledgeConnection = knowledge.find((connection) => connection.sourceId === focusedKnowledgeId);
  const emphasizedKnowledgeConnection = knowledge.find((connection) => connection.emphasized);
  const focusedReviewConnection = review.find((connection) => connection.sourceId === focusedReview?.id);
  const selectedSuggestionPoint = (selection.focus.kind === "suggestion" && selectedSuggestion) ? {
    id: selectedSuggestion.id,
    label: selectedSuggestion.targetName,
    latitude: selectedSuggestion.latitude,
    longitude: selectedSuggestion.longitude,
    kind: "suggested" as const,
  } : undefined;

  const fallbackSpotPoints = spots.map((spot) => ({
    id: spot.id,
    label: spot.name,
    latitude: spot.latitude,
    longitude: spot.longitude,
    kind: "visited" as const,
  }));
  const camera = selection.focus.kind === "none" && selection.focus.preserveCamera
    ? { mode: "none" as const, reason: "none" as const, label: "現在の表示範囲" }
    : lensFocusPoint
    ? { mode: "point" as const, reason: "lens-node" as const, label: lensFocusPoint.label, point: lensFocusPoint }
    : selectedSpot && focusPoint
      ? { mode: "point" as const, reason: "spot" as const, label: selectedSpot.name, point: focusPoint }
    : selectedSuggestionPoint
      ? { mode: "point" as const, reason: "spot" as const, label: selectedSuggestionPoint.label, point: selectedSuggestionPoint }
    : focusedKnowledgeConnection
      ? { mode: "bounds" as const, reason: "connection" as const, label: focusedKnowledgeConnection.title, points: focusedKnowledgeConnection.points, maxZoom: 13 }
      : selectedEntityId && emphasizedKnowledgeConnection
        ? { mode: "bounds" as const, reason: "connection" as const, label: emphasizedKnowledgeConnection.title, points: emphasizedKnowledgeConnection.points, maxZoom: 13 }
      : focusedReview && focusedReviewConnection
        ? { mode: "bounds" as const, reason: "connection" as const, label: focusedReviewConnection.title, points: focusedReviewConnection.points, maxZoom: 13 }
        : suggestion
          ? { mode: "bounds" as const, reason: "suggestion" as const, label: suggestion.title, points: suggestion.points, maxZoom: 11 }
          : viewportPoints.length > 0
            ? { mode: "bounds" as const, reason: "lens" as const, label: "選択中のレンズ", points: viewportPoints, maxZoom: 7.3 }
            : fallbackSpotPoints.length > 0
              ? { mode: "bounds" as const, reason: "journey" as const, label: "表示中の訪問範囲", points: fallbackSpotPoints, maxZoom: 9 }
              : { mode: "none" as const, reason: "none" as const, label: "表示対象なし" };
  const diagnostics: MapSceneDiagnostic[] = [];

  const projectedSourceKeys = new Set(
    connections.map((connection) => `${connection.origin}:${connection.sourceId}`),
  );
  for (const connection of reviewConnections) {
    if (!projectedSourceKeys.has(`exploration:${connection.id}`)) {
      diagnostics.push({
        code: "insufficient-points",
        connectionId: connection.id,
        message: `旅行記接続「${connection.title}」は表示可能な地点が2件未満です。`,
      });
    }
  }
  for (const connection of knowledgeConnections) {
    if (!projectedSourceKeys.has(`knowledge-pack:${connection.id}`)) {
      diagnostics.push({
        code: "insufficient-points",
        connectionId: connection.id,
        message: `Knowledge接続「${connection.title}」は表示可能な地点が2件未満です。`,
      });
    }
  }
  if (selectedSuggestion && !suggestion) {
    diagnostics.push({
      code: "insufficient-points",
      connectionId: selectedSuggestion.id,
      message: `探索候補「${selectedSuggestion.title}」は接続元の地点を解決できません。`,
    });
  }

  for (const connection of connections) {
    const hasEvidence = connection.origin === "knowledge-pack"
      ? connection.assertionIds.length > 0 && connection.sourceIds.length > 0
      : connection.claimIds.length > 0;
    if (!hasEvidence) {
      diagnostics.push({
        code: "missing-evidence",
        connectionId: connection.sourceId,
        message: `接続「${connection.title}」には表示根拠がありません。`,
      });
    }
  }

  const seenIds = new Set<string>();
  for (const connection of connections) {
    if (seenIds.has(connection.id)) {
      diagnostics.push({
        code: "duplicate-id",
        connectionId: connection.sourceId,
        message: `MAP Projection IDが重複しています: ${connection.id}`,
      });
    }
    seenIds.add(connection.id);
  }

  return {
    connections,
    viewportPoints,
    focusPoint,
    camera,
    diagnostics,
  };
}
