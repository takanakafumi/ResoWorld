"use client";

import { memo } from "react";
import type { LensPerspectiveId } from "@/domain/lens-packs/knowledge-registry";
import type { ReviewAtlasConnection, ReviewAtlasSpot, ReviewDataset, ReviewExplorationSuggestion } from "@/domain/review/types";

import { ContextualPerspectiveLens } from "./contextual-perspective-lens";
import styles from "./atlas.module.css";

export type AtlasLensColumnProps = {
  selectedLensId: string;
  selectedConnection?: ReviewAtlasConnection;
  spots: ReviewAtlasSpot[];
  displaySpots?: ReviewAtlasSpot[];
  claims: ReviewDataset["claims"];
  selectedSpotId: string;
  selectedRouteNodeId: string;
  selectedTopicId: string;
  selectedSuggestion?: ReviewExplorationSuggestion;
  suggestions?: ReviewExplorationSuggestion[];
  onSelectTopic: (topicId: string) => void;
  onSelectRouteNode: (nodeId: string) => void;
  onSelectSpot: (spotId: string) => void;
  onSelectSuggestion: (suggestionId: string) => void;
  onSelectRecognitionLens?: (lensId: string, topicId?: string, nodeId?: string) => void;
};

export const AtlasLensColumn = memo(function AtlasLensColumn({
  selectedLensId,
  selectedConnection,
  spots,
  claims,
  selectedSpotId,
  selectedRouteNodeId,
  selectedTopicId,
  selectedSuggestion,
  suggestions = [],
  onSelectTopic,
  onSelectRouteNode,
  onSelectSpot,
  onSelectSuggestion,
  onSelectRecognitionLens,
}: AtlasLensColumnProps) {
  return (
    <div className={styles.lensColumn}>
      {["mythology", "religion", "route", "politics", "people"].includes(selectedLensId) ? (
        <ContextualPerspectiveLens
          perspectiveId={selectedLensId as LensPerspectiveId}
          connection={selectedConnection}
          claims={claims}
          spots={spots}
          selectedSpotId={selectedSpotId}
          selectedNodeId={selectedRouteNodeId}
          selectedTopicId={selectedTopicId}
          selectedSuggestion={selectedSuggestion}
          suggestions={suggestions}
          onSelectTopic={onSelectTopic}
          onSelectNode={onSelectRouteNode}
          onSelectSpot={onSelectSpot}
          onSelectSuggestion={onSelectSuggestion}
          onSelectRecognitionLens={onSelectRecognitionLens}
        />
      ) : null}
    </div>
  );
});
