"use client";

import { memo } from "react";
import type { LensPerspectiveId } from "@/domain/lens-packs/knowledge-registry";
import type { ReviewAtlasConnection, ReviewAtlasSpot, ReviewDataset, ReviewExplorationSuggestion } from "@/domain/review/types";

import { ContextualPerspectiveLens } from "./contextual-perspective-lens";
import styles from "./atlas.module.css";

export type AtlasLensColumnProps = {
  selectedLensId: string;
  selectedConnection?: ReviewAtlasConnection;
  selectedKnowledgeConnectionId?: string;
  spots: ReviewAtlasSpot[];
  displaySpots?: ReviewAtlasSpot[];
  claims: ReviewDataset["claims"];
  selectedSpotId: string;
  selectedRouteNodeId: string;
  selectedTopicId: string;
  selectedSuggestion?: ReviewExplorationSuggestion;
  suggestions?: ReviewExplorationSuggestion[];
  activeScopeClusterId?: string | null;
  onSelectScopeCluster?: (id: string) => void;
  onSelectTopic: (topicId: string) => void;
  onSelectRouteNode: (nodeId: string) => void;
  onSelectSpot: (spotId: string) => void;
  onSelectSuggestion: (suggestionId: string) => void;
  onSelectRecognitionLens?: (lensId: string, topicId?: string, nodeId?: string) => void;
  onSelectKnowledgeConnection?: (connectionId: string) => void;
  hoveredSpotId?: string | null;
  hoveredSuggestionId?: string | null;
  onHoverSpotIds?: (spotIds: readonly string[]) => void;
  onHoverSuggestionIds?: (suggestionIds: readonly string[]) => void;
};

export const AtlasLensColumn = memo(function AtlasLensColumn({
  selectedLensId,
  selectedConnection,
  selectedKnowledgeConnectionId,
  spots,
  claims,
  selectedSpotId,
  selectedRouteNodeId,
  selectedTopicId,
  selectedSuggestion,
  suggestions = [],
  activeScopeClusterId,
  onSelectScopeCluster,
  onSelectTopic,
  onSelectRouteNode,
  onSelectSpot,
  onSelectSuggestion,
  onSelectRecognitionLens,
  onSelectKnowledgeConnection,
  hoveredSpotId,
  hoveredSuggestionId,
  onHoverSpotIds,
  onHoverSuggestionIds,
}: AtlasLensColumnProps) {
  return (
    <div className={styles.lensColumn}>
      {["mythology", "religion", "route", "politics", "people"].includes(selectedLensId) ? (
        <ContextualPerspectiveLens
          perspectiveId={selectedLensId as LensPerspectiveId}
          connection={selectedConnection}
          selectedKnowledgeConnectionId={selectedKnowledgeConnectionId}
          claims={claims}
          spots={spots}
          selectedSpotId={selectedSpotId}
          selectedNodeId={selectedRouteNodeId}
          selectedTopicId={selectedTopicId}
          selectedSuggestion={selectedSuggestion}
          suggestions={suggestions}
          activeScopeClusterId={activeScopeClusterId}
          onSelectScopeCluster={onSelectScopeCluster}
          onSelectTopic={onSelectTopic}
          onSelectNode={onSelectRouteNode}
          onSelectSpot={onSelectSpot}
          onSelectSuggestion={onSelectSuggestion}
          onSelectRecognitionLens={onSelectRecognitionLens}
          onSelectKnowledgeConnection={onSelectKnowledgeConnection}
          hoveredSpotId={hoveredSpotId}
          hoveredSuggestionId={hoveredSuggestionId}
          onHoverSpotIds={onHoverSpotIds}
          onHoverSuggestionIds={onHoverSuggestionIds}
        />
      ) : null}
    </div>
  );
});
