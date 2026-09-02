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
  overlayIds: string[];
  diagnostics: MapSceneDiagnostic[];
};

export function projectMapScene({
  reviewConnections,
  knowledgeConnections = [],
  selectedSuggestion,
  spots,
  selection,
  overlayIds = [],
}: {
  reviewConnections: ReviewAtlasConnection[];
  knowledgeConnections?: LensMapConnectionProjection[];
  selectedSuggestion?: ReviewExplorationSuggestion;
  spots: ReviewAtlasSpot[];
  selection: AtlasSelection;
  overlayIds?: string[];
}): MapSceneProjection {
  const reviewSelection = selection.focus.kind === "exploration-connection"
    ? selection.focus
    : undefined;
  const knowledgeSelectionId = selection.focus.kind === "knowledge-connection"
    ? selection.focus.id
    : "";
  const review = projectReviewMapConnections({
    connections: reviewConnections,
    spots,
    selectedConnectionId: reviewSelection?.id ?? "",
    selectedEraId: reviewSelection?.eraId ?? "",
  });
  const knowledge = projectKnowledgeMapConnections(
    knowledgeConnections,
    knowledgeSelectionId,
  );
  const suggestion = selectedSuggestion
    ? projectSuggestionMapConnection(selectedSuggestion, spots)
    : undefined;
  const connections = [...review, ...knowledge, ...(suggestion ? [suggestion] : [])];
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
    overlayIds: [...new Set(overlayIds)],
    diagnostics,
  };
}
